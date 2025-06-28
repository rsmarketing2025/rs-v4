
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, eachDayOfInterval, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

interface RenewalLineData {
  date: string;
  quantity: number;
  revenue: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface Filters {
  plan: string;
  status: string;
}

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

export const useSubscriptionRenewalsLineData = (
  dateRange: DateRange,
  filters: Filters
) => {
  const [lineData, setLineData] = useState<RenewalLineData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se dateRange é válido
    if (!dateRange.from || !dateRange.to) {
      console.log('📊 Date range invalid, skipping fetch');
      setLoading(false);
      return;
    }

    const fetchLineData = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching subscription renewals line data...');

        // Converter para timezone do Brasil
        const startDate = toZonedTime(startOfDay(dateRange.from), BRAZIL_TIMEZONE);
        const endDate = toZonedTime(endOfDay(dateRange.to), BRAZIL_TIMEZONE);
        
        // Converter de volta para UTC para a query
        const startDateUTC = fromZonedTime(startDate, BRAZIL_TIMEZONE);
        const endDateUTC = fromZonedTime(endDate, BRAZIL_TIMEZONE);
        
        const startDateStr = format(startDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        console.log('📊 Date range for renewals (Brazil timezone):', { 
          originalStart: dateRange.from,
          originalEnd: dateRange.to,
          startDateStr, 
          endDateStr 
        });

        let query = supabase
          .from('subscription_renewals')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr)
          .order('created_at', { ascending: true });

        // Apply filters only if they are not 'all'
        if (filters.plan && filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        if (filters.status && filters.status !== 'all') {
          query = query.eq('subscription_status', filters.status);
        }

        const { data: renewals, error } = await query;

        if (error) {
          console.error('❌ Error fetching renewals line data:', error);
          setLineData([]);
          return;
        }

        console.log('📊 Raw renewals data:', renewals?.length || 0, 'records');

        if (!renewals || renewals.length === 0) {
          console.log('📊 No renewals data found for the period');
          // Ainda assim criar os dias com valores zero
          const allDays = eachDayOfInterval({ 
            start: startOfDay(dateRange.from), 
            end: endOfDay(dateRange.to) 
          });
          const emptyData = allDays.map(day => ({
            date: format(day, 'dd/MM'),
            quantity: 0,
            revenue: 0
          }));
          setLineData(emptyData);
          return;
        }

        // Generate all days in the range (local time)
        const allDays = eachDayOfInterval({ 
          start: startOfDay(dateRange.from), 
          end: endOfDay(dateRange.to) 
        });
        
        // Group renewals by date
        const renewalsByDate: Record<string, { quantity: number; revenue: number }> = {};
        
        // Initialize all days with zero values
        allDays.forEach(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          renewalsByDate[dateKey] = { quantity: 0, revenue: 0 };
        });

        // Process renewals data
        renewals.forEach(renewal => {
          if (renewal.created_at) {
            try {
              // Parse the date from database and convert to Brazil timezone
              const renewalDateUTC = parseISO(renewal.created_at);
              const renewalDateLocal = toZonedTime(renewalDateUTC, BRAZIL_TIMEZONE);
              const dateKey = format(renewalDateLocal, 'yyyy-MM-dd');
              
              if (renewalsByDate[dateKey]) {
                renewalsByDate[dateKey].quantity += 1;
                renewalsByDate[dateKey].revenue += Number(renewal.amount) || 0;
              }
            } catch (error) {
              console.warn('📊 Error parsing renewal date:', renewal.created_at, error);
            }
          }
        });

        // Convert to array format for chart
        const chartData: RenewalLineData[] = allDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const displayDate = format(day, 'dd/MM');
          
          return {
            date: displayDate,
            quantity: renewalsByDate[dateKey]?.quantity || 0,
            revenue: renewalsByDate[dateKey]?.revenue || 0
          };
        });

        setLineData(chartData);

        console.log('✅ Renewals line data processed:', {
          totalDays: chartData.length,
          totalRenewals: chartData.reduce((sum, item) => sum + item.quantity, 0),
          totalRevenue: chartData.reduce((sum, item) => sum + item.revenue, 0),
          sampleData: chartData.slice(0, 3)
        });

      } catch (error) {
        console.error('❌ Error in fetchLineData:', error);
        setLineData([]);
      } finally {
        setLoading(false);
      }
    };

    // Adicionar um pequeno delay para evitar múltiplas chamadas
    const timeoutId = setTimeout(fetchLineData, 100);
    
    return () => clearTimeout(timeoutId);
  }, [dateRange.from?.getTime(), dateRange.to?.getTime(), filters.plan, filters.status]);

  return { lineData, loading };
};
