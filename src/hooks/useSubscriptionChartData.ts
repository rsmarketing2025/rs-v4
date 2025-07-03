
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface ChartFilters {
  plan: string;
  eventType: string;
  paymentMethod: string;
  status: string;
  products: string[];
}

interface DateRange {
  from: Date;
  to: Date;
}

interface ChartDataItem {
  date: string;
  plan: string;
  status: string;
  amount: number;
  revenue: number;
  customer_name: string;
  customer_email: string;
  event_type?: string;
  payment_method?: string;
}

export const useSubscriptionChartData = (
  dateRange: DateRange,
  filters: ChartFilters,
  type: 'subscriptions' | 'renewals' = 'subscriptions'
) => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        console.log(`📊 Fetching ${type} chart data with filters:`, filters);

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        const tableName = type === 'renewals' ? 'subscription_renewals' : 'subscription_status';
        
        let query = supabase
          .from(tableName)
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        // Apply status filter
        if (filters.status !== 'all') {
          if (filters.status === 'active') {
            query = query.eq('subscription_status', 'active');
          } else if (filters.status === 'canceled') {
            query = query.eq('subscription_status', 'canceled');
          } else if (filters.status === 'expired') {
            query = query.eq('subscription_status', 'expired');
          }
        }

        // Apply product filter (only for renewals tab)
        if (type === 'renewals' && filters.products.length > 0) {
          console.log('🔍 Applying product filter for renewals:', filters.products);
          query = query.in('plan', filters.products);
        }

        const { data, error } = await query;

        if (error) {
          console.error(`❌ Error fetching ${type} data:`, error);
          return;
        }

        if (data) {
          const chartData: ChartDataItem[] = data.map(item => ({
            date: item.created_at,
            plan: item.plan || 'Unknown',
            status: item.subscription_status || 'unknown',
            amount: item.amount || 0,
            revenue: item.amount || 0,
            customer_name: item.customer_name || '',
            customer_email: item.customer_email || '',
            event_type: type,
            payment_method: 'subscription'
          }));

          setChartData(chartData);
          
          console.log(`✅ ${type} chart data loaded:`, {
            count: chartData.length,
            filtersApplied: {
              status: filters.status,
              products: filters.products.length > 0 ? filters.products : 'none'
            }
          });
        }

      } catch (error) {
        console.error(`❌ Error fetching ${type} chart data:`, error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [dateRange, filters, type]);

  return { chartData, loading };
};
