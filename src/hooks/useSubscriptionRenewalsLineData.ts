
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, eachDayOfInterval, parseISO } from 'date-fns';

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

export const useSubscriptionRenewalsLineData = (
  dateRange: DateRange,
  filters: Filters
) => {
  const [lineData, setLineData] = useState<RenewalLineData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLineData = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching subscription renewals line data...');

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        
        // Usar formato de data mais simples
        const startDateStr = format(startDate, "yyyy-MM-dd");
        const endDateStr = format(endDate, "yyyy-MM-dd");

        console.log('Date range:', { startDateStr, endDateStr });

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

        console.log('📊 Raw renewals data:', renewals);

        // Generate all days in the range
        const allDays = eachDayOfInterval({ start: startDate, end: endDate });
        
        // Group renewals by date
        const renewalsByDate: Record<string, { quantity: number; revenue: number }> = {};
        
        // Initialize all days with zero values
        allDays.forEach(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          renewalsByDate[dateKey] = { quantity: 0, revenue: 0 };
        });

        // Process renewals data
        renewals?.forEach(renewal => {
          if (renewal.created_at) {
            const dateKey = format(parseISO(renewal.created_at), 'yyyy-MM-dd');
            if (renewalsByDate[dateKey]) {
              renewalsByDate[dateKey].quantity += 1;
              renewalsByDate[dateKey].revenue += renewal.amount || 0;
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

    fetchLineData();
  }, [dateRange, filters]);

  return { lineData, loading };
};
