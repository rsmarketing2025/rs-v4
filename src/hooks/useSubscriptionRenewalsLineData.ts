
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
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        let query = supabase
          .from('subscription_renewals')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr)
          .order('created_at', { ascending: true });

        // Apply filters
        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        if (filters.status !== 'all') {
          query = query.eq('subscription_status', filters.status);
        }

        const { data: renewals, error } = await query;

        if (error) {
          console.error('❌ Error fetching renewals line data:', error);
          return;
        }

        // Generate all days in the range
        const allDays = eachDayOfInterval({ start: startDate, end: endDate });
        
        // Group renewals by date
        const renewalsByDate: Record<string, { quantity: number; revenue: number }> = {};
        
        allDays.forEach(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          renewalsByDate[dateKey] = { quantity: 0, revenue: 0 };
        });

        renewals?.forEach(renewal => {
          const dateKey = format(parseISO(renewal.created_at), 'yyyy-MM-dd');
          if (renewalsByDate[dateKey]) {
            renewalsByDate[dateKey].quantity += 1;
            renewalsByDate[dateKey].revenue += renewal.amount || 0;
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

        console.log('✅ Renewals line data loaded:', {
          totalDays: chartData.length,
          totalRenewals: chartData.reduce((sum, item) => sum + item.quantity, 0),
          totalRevenue: chartData.reduce((sum, item) => sum + item.revenue, 0)
        });

      } catch (error) {
        console.error('❌ Error fetching renewals line data:', error);
        setLineData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLineData();
  }, [dateRange, filters]);

  return { lineData, loading };
};
