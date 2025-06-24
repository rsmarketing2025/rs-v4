
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
        console.log('📊 [SUBSCRIPTION METRICS] Date range:', {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
          filters
        });

        // 1. Get active subscriptions from subscription_status table (using "Ativo")
        let activeQuery = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .eq('subscription_status', 'Ativo');

        if (filters.plan !== 'all') {
          activeQuery = activeQuery.eq('plan', filters.plan);
        }

        const { count: activeCount, data: activeSubscriptions, error: activeError } = await activeQuery;

        if (activeError) {
          console.error('❌ [SUBSCRIPTION METRICS] Error fetching active subscriptions:', activeError);
        } else {
          console.log('✅ [SUBSCRIPTION METRICS] Active subscriptions found:', activeCount);
        }

        // Calculate MRR ONLY from active subscriptions
        const totalMRR = (activeSubscriptions || []).reduce((sum, sub) => {
          return sum + (Number(sub.amount) || 0);
        }, 0);

        console.log('💰 [SUBSCRIPTION METRICS] Total MRR calculated:', totalMRR);

        // 2. Get new subscriptions created in the period from subscription_status table
        let newSubsQuery = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());

        if (filters.plan !== 'all') {
          newSubsQuery = newSubsQuery.eq('plan', filters.plan);
        }

        const { count: newSubscriptionsCount, error: newSubsError } = await newSubsQuery;

        if (newSubsError) {
          console.error('❌ [SUBSCRIPTION METRICS] Error fetching new subscriptions:', newSubsError);
        } else {
          console.log('🆕 [SUBSCRIPTION METRICS] New subscriptions found:', newSubscriptionsCount);
        }

        // 3. DETAILED CANCELLATIONS QUERY WITH DEBUG
        console.log('🔍 [CANCELLATIONS] Starting cancellations query...');
        console.log('🔍 [CANCELLATIONS] Looking for status "Cancelado" with updated_at between:', {
          start: dateRange.from.toISOString(),
          end: dateRange.to.toISOString()
        });

        // First, let's check what statuses exist in the table
        const { data: allStatuses, error: statusError } = await supabase
          .from('subscription_status')
          .select('subscription_status')
          .not('subscription_status', 'is', null);

        if (statusError) {
          console.error('❌ [CANCELLATIONS] Error fetching all statuses:', statusError);
        } else {
          const uniqueStatuses = [...new Set(allStatuses?.map(s => s.subscription_status) || [])];
          console.log('📋 [CANCELLATIONS] All unique statuses in database:', uniqueStatuses);
        }

        // Now try different status variations to find the correct one
        const possibleCancelStatuses = ['Cancelado', 'cancelado', 'Cancelled', 'cancelled', 'canceled', 'Canceled'];
        
        let cancellationsCount = 0;
        let foundStatus = null;

        for (const status of possibleCancelStatuses) {
          let cancellationsQuery = supabase
            .from('subscription_status')
            .select('*', { count: 'exact' })
            .eq('subscription_status', status)
            .gte('updated_at', dateRange.from.toISOString())
            .lte('updated_at', dateRange.to.toISOString());

          if (filters.plan !== 'all') {
            cancellationsQuery = cancellationsQuery.eq('plan', filters.plan);
          }

          const { count, data, error } = await cancellationsQuery;

          console.log(`🔍 [CANCELLATIONS] Trying status "${status}":`, {
            count: count || 0,
            error: error?.message || 'none',
            dataLength: data?.length || 0
          });

          if (!error && count && count > 0) {
            cancellationsCount = count;
            foundStatus = status;
            console.log(`✅ [CANCELLATIONS] Found cancellations with status "${status}":`, count);
            console.log('📄 [CANCELLATIONS] Sample data:', data?.slice(0, 2));
            break;
          }
        }

        if (!foundStatus) {
          console.log('⚠️ [CANCELLATIONS] No cancellations found with any status variation');
          
          // Let's also check if there are any records with updated_at in the date range regardless of status
          const { count: anyUpdatedCount, data: anyUpdatedData } = await supabase
            .from('subscription_status')
            .select('*', { count: 'exact' })
            .gte('updated_at', dateRange.from.toISOString())
            .lte('updated_at', dateRange.to.toISOString());

          console.log('📊 [CANCELLATIONS] Records with updated_at in date range (any status):', {
            count: anyUpdatedCount || 0,
            sampleData: anyUpdatedData?.slice(0, 3)
          });
        }

        // 4. Calculate churn rate
        const churnRate = (activeCount || 0) > 0 
          ? ((cancellationsCount || 0) / ((activeCount || 0) + (cancellationsCount || 0))) * 100 
          : 0;

        const finalMetrics = {
          activeSubscriptions: activeCount || 0,
          activeSubscriptionsGrowth: 15.2, // Placeholder for growth calculation
          newSubscriptions: newSubscriptionsCount || 0,
          newSubscriptionsGrowth: 8.5, // Placeholder for growth calculation
          cancellations: cancellationsCount || 0,
          cancellationsGrowth: -5.3, // Placeholder for growth calculation
          mrr: totalMRR,
          mrrGrowth: 12.3, // Placeholder for growth calculation
          churnRate: parseFloat(churnRate.toFixed(1)),
          churnRateChange: -2.1 // Placeholder for growth calculation
        };

        console.log('📈 [SUBSCRIPTION METRICS] Final metrics calculated:', {
          activeSubscriptions: finalMetrics.activeSubscriptions,
          newSubscriptions: finalMetrics.newSubscriptions,
          cancellations: finalMetrics.cancellations,
          mrr: finalMetrics.mrr.toFixed(2),
          churnRate: finalMetrics.churnRate + '%',
          statusUsedForCancellations: foundStatus || 'none found'
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
