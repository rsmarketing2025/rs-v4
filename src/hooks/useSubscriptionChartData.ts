
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface ChartFilters {
  plan: string;
  eventType: string;
  paymentMethod: string;
  status: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface ChartDataItem {
  date: string;
  revenue: number;
  plan: string;
}

export const useSubscriptionChartData = (
  dateRange: DateRange,
  filters: ChartFilters,
  type: 'subscriptions' | 'renewals'
) => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        console.log(`📊 Fetching ${type} chart data with product filter:`, filters.plan);

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        if (type === 'renewals') {
          // Use subscription_renewals table for renewals
          let query = supabase
            .from('subscription_renewals')
            .select('*')
            .gte('created_at', startDateStr)
            .lte('created_at', endDateStr);

          // Apply product filter if not "all"
          if (filters.plan !== 'all') {
            query = query.eq('plan', filters.plan);
          }

          const { data: renewals, error } = await query;

          if (error) {
            console.error('❌ Error fetching renewals:', error);
            return;
          }

          if (renewals) {
            const chartData: ChartDataItem[] = renewals.map(renewal => ({
              date: renewal.created_at,
              revenue: renewal.amount || 0,
              plan: renewal.plan || 'Unknown'
            }));

            setChartData(chartData);
          }
        } else {
          // For subscriptions, we'll use both product_sales and subscription_events
          let productSalesQuery = supabase
            .from('product_sales')
            .select('*')
            .gte('sale_date', startDateStr)
            .lte('sale_date', endDateStr);

          let subscriptionEventsQuery = supabase
            .from('subscription_events')
            .select('*')
            .gte('event_date', startDateStr)
            .lte('event_date', endDateStr)
            .eq('event_type', 'subscription');

          // Apply product filter if not "all"
          if (filters.plan !== 'all') {
            productSalesQuery = productSalesQuery.eq('product_name', filters.plan);
            subscriptionEventsQuery = subscriptionEventsQuery.eq('plan', filters.plan);
          }

          const [productSalesResult, subscriptionEventsResult] = await Promise.all([
            productSalesQuery,
            subscriptionEventsQuery
          ]);

          if (productSalesResult.error || subscriptionEventsResult.error) {
            console.error('❌ Error fetching subscription data:', 
              productSalesResult.error || subscriptionEventsResult.error);
            return;
          }

          const chartData: ChartDataItem[] = [];

          // Add product sales data
          if (productSalesResult.data) {
            productSalesResult.data.forEach(sale => {
              chartData.push({
                date: sale.sale_date,
                revenue: sale.sale_value || 0,
                plan: sale.product_name || 'Unknown'
              });
            });
          }

          // Add subscription events data
          if (subscriptionEventsResult.data) {
            subscriptionEventsResult.data.forEach(event => {
              chartData.push({
                date: event.event_date,
                revenue: event.amount || 0,
                plan: event.plan || 'Unknown'
              });
            });
          }

          setChartData(chartData);
        }

        console.log(`✅ ${type} chart data loaded:`, chartData.length, 'items');

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
