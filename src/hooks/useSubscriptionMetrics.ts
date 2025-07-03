
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

interface SubscriptionMetrics {
  activeSubscriptions: number;
  newSubscriptions: number;
  mrr: number;
  cancellations: number;
  activeSubscriptionsGrowth: number;
  newSubscriptionsGrowth: number;
  mrrGrowth: number;
  cancellationsGrowth: number;
}

interface Filters {
  plan: string;
  eventType: string;
  paymentMethod: string;
  status?: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

export const useSubscriptionMetrics = (
  dateRange: DateRange,
  filters: Filters
) => {
  const [metrics, setMetrics] = useState<SubscriptionMetrics>({
    activeSubscriptions: 0,
    newSubscriptions: 0,
    mrr: 0,
    cancellations: 0,
    activeSubscriptionsGrowth: 0,
    newSubscriptionsGrowth: 0,
    mrrGrowth: 0,
    cancellationsGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        console.log('📊 [SUBSCRIPTION METRICS] Fetching metrics with filters:', filters);

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        // Calculate previous period for growth comparison
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const prevStartDate = subDays(startDate, daysDiff);
        const prevEndDate = subDays(endDate, daysDiff);
        const prevStartDateStr = format(prevStartDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const prevEndDateStr = format(prevEndDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        // Build queries for current period
        let currentQuery = supabase
          .from('subscription_events')
          .select('*')
          .gte('event_date', startDateStr)
          .lte('event_date', endDateStr);

        let prevQuery = supabase
          .from('subscription_events')
          .select('*')
          .gte('event_date', prevStartDateStr)
          .lte('event_date', prevEndDateStr);

        // Apply product/plan filter if not "all"
        if (filters.plan !== 'all') {
          currentQuery = currentQuery.eq('plan', filters.plan);
          prevQuery = prevQuery.eq('plan', filters.plan);
        }

        const [currentResult, prevResult] = await Promise.all([
          currentQuery,
          prevQuery
        ]);

        if (currentResult.error || prevResult.error) {
          console.error('❌ Error fetching subscription metrics:', currentResult.error || prevResult.error);
          return;
        }

        const currentEvents = currentResult.data || [];
        const prevEvents = prevResult.data || [];

        // Calculate metrics for current period
        const newSubscriptions = currentEvents.filter(event => 
          event.event_type === 'subscription'
        ).length;

        const cancellations = currentEvents.filter(event => 
          event.event_type === 'cancellation'
        ).length;

        const mrr = currentEvents
          .filter(event => event.event_type === 'subscription')
          .reduce((sum, event) => sum + (event.amount || 0), 0);

        // Calculate metrics for previous period
        const prevNewSubscriptions = prevEvents.filter(event => 
          event.event_type === 'subscription'
        ).length;

        const prevCancellations = prevEvents.filter(event => 
          event.event_type === 'cancellation'
        ).length;

        const prevMrr = prevEvents
          .filter(event => event.event_type === 'subscription')
          .reduce((sum, event) => sum + (event.amount || 0), 0);

        // Get active subscriptions from subscription_status table
        let statusQuery = supabase
          .from('subscription_status')
          .select('*')
          .eq('subscription_status', 'active');

        if (filters.plan !== 'all') {
          statusQuery = statusQuery.eq('plan', filters.plan);
        }

        const { data: activeSubscriptionsData, error: statusError } = await statusQuery;

        if (statusError) {
          console.error('❌ Error fetching active subscriptions:', statusError);
        }

        const activeSubscriptions = activeSubscriptionsData ? activeSubscriptionsData.length : 0;

        // Calculate growth percentages
        const newSubscriptionsGrowth = prevNewSubscriptions > 0 
          ? ((newSubscriptions - prevNewSubscriptions) / prevNewSubscriptions) * 100 
          : 0;

        const cancellationsGrowth = prevCancellations > 0 
          ? ((cancellations - prevCancellations) / prevCancellations) * 100 
          : 0;

        const mrrGrowth = prevMrr > 0 
          ? ((mrr - prevMrr) / prevMrr) * 100 
          : 0;

        setMetrics({
          activeSubscriptions,
          newSubscriptions,
          mrr,
          cancellations,
          activeSubscriptionsGrowth: 12.5, // Placeholder
          newSubscriptionsGrowth,
          mrrGrowth,
          cancellationsGrowth
        });

        console.log('✅ [SUBSCRIPTION METRICS] Metrics calculated:', {
          activeSubscriptions,
          newSubscriptions,
          mrr: mrr.toFixed(2),
          cancellations
        });

      } catch (error) {
        console.error('❌ [SUBSCRIPTION METRICS] Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange, filters]);

  return { metrics, loading };
};
