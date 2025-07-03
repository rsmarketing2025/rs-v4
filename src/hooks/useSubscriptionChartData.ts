
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
        console.log(`📊 Fetching ${type} chart data...`);

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

          if (filters.plan !== 'all') {
            query = query.eq('plan', filters.plan);
          }

          if (filters.status !== 'all') {
            query = query.eq('subscription_status', filters.status);
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
          // Use subscription_events for subscriptions
          let query = supabase
            .from('subscription_events')
            .select('*')
            .gte('event_date', startDateStr)
            .lte('event_date', endDateStr);

          if (filters.plan !== 'all') {
            query = query.eq('plan', filters.plan);
          }

          if (filters.eventType !== 'all') {
            query = query.eq('event_type', filters.eventType);
          }

          const { data: events, error } = await query;

          if (error) {
            console.error('❌ Error fetching subscription events:', error);
            return;
          }

          if (events) {
            const chartData: ChartDataItem[] = events.map(event => ({
              date: event.event_date,
              revenue: event.amount || 0,
              plan: event.plan || 'Unknown'
            }));

            setChartData(chartData);
          }
        }

        console.log(`✅ ${type} chart data loaded:`, chartData.length);

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
