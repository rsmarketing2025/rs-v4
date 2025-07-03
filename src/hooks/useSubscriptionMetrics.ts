
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

        // Get new subscriptions from subscription_status table (current period)
        let newSubsQuery = supabase
          .from('subscription_status')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr)
          .in('subscription_status', ['active', 'ativo', 'Active', 'Ativo']);

        if (filters.plan !== 'all') {
          newSubsQuery = newSubsQuery.eq('plan', filters.plan);
        }

        // Get new subscriptions from subscription_status table (previous period)
        let prevNewSubsQuery = supabase
          .from('subscription_status')
          .select('*')
          .gte('created_at', prevStartDateStr)
          .lte('created_at', prevEndDateStr)
          .in('subscription_status', ['active', 'ativo', 'Active', 'Ativo']);

        if (filters.plan !== 'all') {
          prevNewSubsQuery = prevNewSubsQuery.eq('plan', filters.plan);
        }

        // Build queries for cancellations from subscription_events
        let currentEventsQuery = supabase
          .from('subscription_events')
          .select('*')
          .gte('event_date', startDateStr)
          .lte('event_date', endDateStr);

        let prevEventsQuery = supabase
          .from('subscription_events')
          .select('*')
          .gte('event_date', prevStartDateStr)
          .lte('event_date', prevEndDateStr);

        // Apply product/plan filter if not "all"
        if (filters.plan !== 'all') {
          currentEventsQuery = currentEventsQuery.eq('plan', filters.plan);
          prevEventsQuery = prevEventsQuery.eq('plan', filters.plan);
        }

        // Get ALL active subscriptions for MRR calculation (not filtered by date)
        let allActiveSubsQuery = supabase
          .from('subscription_status')
          .select('*')
          .in('subscription_status', ['active', 'ativo', 'Active', 'Ativo']);

        if (filters.plan !== 'all') {
          allActiveSubsQuery = allActiveSubsQuery.eq('plan', filters.plan);
        }

        // Get active subscriptions from subscription_status table for count
        let statusQuery = supabase
          .from('subscription_status')
          .select('*')
          .in('subscription_status', ['active', 'ativo', 'Active', 'Ativo']);

        if (filters.plan !== 'all') {
          statusQuery = statusQuery.eq('plan', filters.plan);
        }

        const [
          newSubsResult,
          prevNewSubsResult,
          currentEventsResult,
          prevEventsResult,
          allActiveSubsResult,
          activeSubscriptionsResult
        ] = await Promise.all([
          newSubsQuery,
          prevNewSubsQuery,
          currentEventsQuery,
          prevEventsQuery,
          allActiveSubsQuery,
          statusQuery
        ]);

        if (newSubsResult.error || prevNewSubsResult.error || currentEventsResult.error || 
            prevEventsResult.error || allActiveSubsResult.error || activeSubscriptionsResult.error) {
          console.error('❌ Error fetching subscription metrics:', 
            newSubsResult.error || prevNewSubsResult.error || currentEventsResult.error || 
            prevEventsResult.error || allActiveSubsResult.error || activeSubscriptionsResult.error);
          return;
        }

        const newSubscriptionsData = newSubsResult.data || [];
        const prevNewSubscriptionsData = prevNewSubsResult.data || [];
        const currentEvents = currentEventsResult.data || [];
        const prevEvents = prevEventsResult.data || [];
        const allActiveSubscriptions = allActiveSubsResult.data || [];
        const activeSubscriptionsData = activeSubscriptionsResult.data || [];

        // Calculate new subscriptions from subscription_status table
        const newSubscriptions = newSubscriptionsData.length;
        const prevNewSubscriptions = prevNewSubscriptionsData.length;

        // Calculate MRR from ALL active subscriptions (not filtered by date)
        const mrr = allActiveSubscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
        
        // For MRR growth comparison, calculate previous period's total MRR
        // This would be all active subscriptions at the start of the current period
        const prevMrr = prevNewSubscriptionsData.reduce((sum, sub) => sum + (sub.amount || 0), 0);

        // Calculate cancellations from subscription_events
        const cancellations = currentEvents.filter(event => 
          event.event_type === 'cancellation' || event.event_type === 'canceled' || event.event_type === 'cancelled'
        ).length;

        const prevCancellations = prevEvents.filter(event => 
          event.event_type === 'cancellation' || event.event_type === 'canceled' || event.event_type === 'cancelled'
        ).length;

        const activeSubscriptions = activeSubscriptionsData.length;

        // Calculate growth percentages
        const newSubscriptionsGrowth = prevNewSubscriptions > 0 
          ? ((newSubscriptions - prevNewSubscriptions) / prevNewSubscriptions) * 100 
          : 0;

        const cancellationsGrowth = prevCancellations > 0 
          ? ((cancellations - prevCancellations) / prevCancellations) * 100 
          : 0;

        // For MRR growth, we'll use a simplified calculation since we want total MRR
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
          cancellations,
          'Total active subscriptions for MRR': allActiveSubscriptions.length,
          'MRR calculation': `Sum of all active subscription amounts: ${mrr.toFixed(2)}`,
          'newSubscriptionsData.length': newSubscriptionsData.length,
          'currentEvents.length': currentEvents.length,
          'events by type': {
            subscription: currentEvents.filter(e => e.event_type === 'subscription').length,
            created: currentEvents.filter(e => e.event_type === 'created').length,
            subscription_created: currentEvents.filter(e => e.event_type === 'subscription_created').length,
            cancellation: currentEvents.filter(e => e.event_type === 'cancellation').length,
            canceled: currentEvents.filter(e => e.event_type === 'canceled').length,
            cancelled: currentEvents.filter(e => e.event_type === 'cancelled').length,
          }
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
