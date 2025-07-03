
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface SubscriptionMetrics {
  activeSubscriptions: number;
  activeSubscriptionsGrowth: number;
  newSubscriptions: number;
  newSubscriptionsGrowth: number;
  cancellations: number;
  cancellationsGrowth: number;
  mrr: number;
  mrrGrowth: number;
  churnRate: number;
  churnRateChange: number;
}

interface Filters {
  plan: string;
  eventType: string;
  paymentMethod: string;
  products: string[];
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
    activeSubscriptionsGrowth: 0,
    newSubscriptions: 0,
    newSubscriptionsGrowth: 0,
    cancellations: 0,
    cancellationsGrowth: 0,
    mrr: 0,
    mrrGrowth: 0,
    churnRate: 0,
    churnRateChange: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        console.log('📊 [SUBSCRIPTION METRICS] Starting to fetch subscription metrics...');

        // Use the same date formatting approach as the KPI hook for consistency
        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        console.log('📊 [SUBSCRIPTION METRICS] Date range (formatted like KPIs):', {
          from: startDateStr,
          to: endDateStr,
          originalFrom: dateRange.from.toISOString(),
          originalTo: dateRange.to.toISOString(),
          filters
        });

        // 1. Get active subscriptions from subscription_status table
        let activeQuery = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .eq('subscription_status', 'Ativo');

        if (filters.plan !== 'all') {
          activeQuery = activeQuery.eq('plan', filters.plan);
        }

        // Apply product filter if products are selected
        if (filters.products.length > 0) {
          activeQuery = activeQuery.in('plan', filters.products);
        }

        const { count: activeCount, data: activeSubscriptions, error: activeError } = await activeQuery;

        if (activeError) {
          console.error('❌ [SUBSCRIPTION METRICS] Error fetching active subscriptions:', activeError);
        } else {
          console.log('✅ [SUBSCRIPTION METRICS] Active subscriptions found:', activeCount);
        }

        // Calculate MRR from active subscriptions
        const totalMRR = (activeSubscriptions || []).reduce((sum, sub) => {
          return sum + (Number(sub.amount) || 0);
        }, 0);

        console.log('💰 [SUBSCRIPTION METRICS] Total MRR calculated:', totalMRR);

        // 2. Get new subscriptions created in the period
        let newSubsQuery = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        if (filters.plan !== 'all') {
          newSubsQuery = newSubsQuery.eq('plan', filters.plan);
        }

        // Apply product filter if products are selected
        if (filters.products.length > 0) {
          newSubsQuery = newSubsQuery.in('plan', filters.products);
        }

        const { count: newSubscriptionsCount, error: newSubsError } = await newSubsQuery;

        if (newSubsError) {
          console.error('❌ [SUBSCRIPTION METRICS] Error fetching new subscriptions:', newSubsError);
        } else {
          console.log('🆕 [SUBSCRIPTION METRICS] New subscriptions found:', newSubscriptionsCount);
        }

        // 3. FIXED CANCELLATIONS ANALYSIS WITH MULTIPLE APPROACHES
        console.log('🔍 [CANCELLATIONS] Starting FIXED cancellations analysis...');
        
        // Get sample of all canceled subscriptions to understand the data structure
        const { data: allCancellations, error: allCancError } = await supabase
          .from('subscription_status')
          .select('*')
          .eq('subscription_status', 'Cancelado')
          .limit(5);

        if (allCancError) {
          console.error('❌ [CANCELLATIONS] Error fetching sample cancellations:', allCancError);
        } else {
          console.log('📊 [CANCELLATIONS] Sample cancellations for analysis:', 
            allCancellations?.map(c => ({
              id: c.id,
              customer_name: c.customer_name,
              created_at: c.created_at,
              updated_at: c.updated_at,
              canceled_at: c.canceled_at,
              subscription_status: c.subscription_status
            }))
          );
        }

        // Approach 1: Query by updated_at (when status was changed to canceled)
        let cancellationsQuery1 = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .eq('subscription_status', 'Cancelado')
          .gte('updated_at', startDateStr)
          .lte('updated_at', endDateStr);

        if (filters.plan !== 'all') {
          cancellationsQuery1 = cancellationsQuery1.eq('plan', filters.plan);
        }

        // Apply product filter if products are selected
        if (filters.products.length > 0) {
          cancellationsQuery1 = cancellationsQuery1.in('plan', filters.products);
        }

        const { count: cancellationsCount1, data: cancellationsData1, error: cancellationsError1 } = await cancellationsQuery1;

        console.log('🎯 [CANCELLATIONS] Approach 1 (updated_at):', {
          count: cancellationsCount1 || 0,
          error: cancellationsError1?.message || 'none',
          dateRange: `${startDateStr} to ${endDateStr}`,
          sampleData: cancellationsData1?.slice(0, 2)?.map(c => ({
            customer_name: c.customer_name,
            updated_at: c.updated_at,
            subscription_status: c.subscription_status
          }))
        });

        // Approach 2: Query by canceled_at if it exists
        let cancellationsQuery2 = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .eq('subscription_status', 'Cancelado')
          .not('canceled_at', 'is', null)
          .gte('canceled_at', startDateStr)
          .lte('canceled_at', endDateStr);

        if (filters.plan !== 'all') {
          cancellationsQuery2 = cancellationsQuery2.eq('plan', filters.plan);
        }

        // Apply product filter if products are selected
        if (filters.products.length > 0) {
          cancellationsQuery2 = cancellationsQuery2.in('plan', filters.products);
        }

        const { count: cancellationsCount2, data: cancellationsData2, error: cancellationsError2 } = await cancellationsQuery2;

        console.log('📅 [CANCELLATIONS] Approach 2 (canceled_at):', {
          count: cancellationsCount2 || 0,
          error: cancellationsError2?.message || 'none',
          dateRange: `${startDateStr} to ${endDateStr}`,
          sampleData: cancellationsData2?.slice(0, 2)?.map(c => ({
            customer_name: c.customer_name,
            canceled_at: c.canceled_at,
            subscription_status: c.subscription_status
          }))
        });

        // Approach 3: Also check subscription_events table for cancellation events
        let cancellationEventsQuery = supabase
          .from('subscription_events')
          .select('*', { count: 'exact' })
          .in('event_type', ['cancellation', 'cancelled', 'canceled'])
          .gte('event_date', startDateStr)
          .lte('event_date', endDateStr);

        if (filters.plan !== 'all') {
          cancellationEventsQuery = cancellationEventsQuery.eq('plan', filters.plan);
        }

        // Apply product filter if products are selected
        if (filters.products.length > 0) {
          cancellationEventsQuery = cancellationEventsQuery.in('plan', filters.products);
        }

        const { count: cancellationEventsCount, data: cancellationEventsData, error: cancellationEventsError } = await cancellationEventsQuery;

        console.log('🔄 [CANCELLATIONS] Approach 3 (subscription_events):', {
          count: cancellationEventsCount || 0,
          error: cancellationEventsError?.message || 'none',
          dateRange: `${startDateStr} to ${endDateStr}`,
          sampleData: cancellationEventsData?.slice(0, 2)?.map(e => ({
            subscription_id: e.subscription_id,
            event_type: e.event_type,
            event_date: e.event_date,
            customer_name: e.customer_name
          }))
        });

        // Use the maximum count from all approaches to ensure we don't miss any cancellations
        const finalCancellationsCount = Math.max(
          cancellationsCount1 || 0,
          cancellationsCount2 || 0,
          cancellationEventsCount || 0
        );

        console.log('✅ [CANCELLATIONS] FINAL cancellations count decision:', {
          approach1_updated_at: cancellationsCount1 || 0,
          approach2_canceled_at: cancellationsCount2 || 0,
          approach3_events: cancellationEventsCount || 0,
          finalCount: finalCancellationsCount,
          selectedApproach: finalCancellationsCount === (cancellationsCount1 || 0) ? 'updated_at' :
                           finalCancellationsCount === (cancellationsCount2 || 0) ? 'canceled_at' : 'events'
        });

        // 4. Calculate churn rate
        const churnRate = (activeCount || 0) > 0 
          ? ((finalCancellationsCount || 0) / ((activeCount || 0) + (finalCancellationsCount || 0))) * 100 
          : 0;

        const finalMetrics = {
          activeSubscriptions: activeCount || 0,
          activeSubscriptionsGrowth: 15.2, // Placeholder for growth calculation
          newSubscriptions: newSubscriptionsCount || 0,
          newSubscriptionsGrowth: 8.5, // Placeholder for growth calculation
          cancellations: finalCancellationsCount || 0,
          cancellationsGrowth: -5.3, // Placeholder for growth calculation
          mrr: totalMRR,
          mrrGrowth: 12.3, // Placeholder for growth calculation
          churnRate: parseFloat(churnRate.toFixed(1)),
          churnRateChange: -2.1 // Placeholder for growth calculation
        };

        console.log('📈 [SUBSCRIPTION METRICS] FINAL metrics calculated:', {
          activeSubscriptions: finalMetrics.activeSubscriptions,
          newSubscriptions: finalMetrics.newSubscriptions,
          cancellations: finalMetrics.cancellations,
          mrr: finalMetrics.mrr.toFixed(2),
          churnRate: finalMetrics.churnRate + '%',
          dateRangeUsed: `${startDateStr} to ${endDateStr}`,
          productsFilter: filters.products.length > 0 ? filters.products : 'none'
        });

        setMetrics(finalMetrics);

      } catch (error) {
        console.error('❌ [SUBSCRIPTION METRICS] Unexpected error:', error);
        setMetrics({
          activeSubscriptions: 0,
          activeSubscriptionsGrowth: 0,
          newSubscriptions: 0,
          newSubscriptionsGrowth: 0,
          cancellations: 0,
          cancellationsGrowth: 0,
          mrr: 0,
          mrrGrowth: 0,
          churnRate: 0,
          churnRateChange: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange, filters]);

  return { metrics, loading };
};
