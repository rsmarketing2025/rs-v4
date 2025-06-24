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

        // 3. ENHANCED CANCELLATIONS ANALYSIS
        console.log('🔍 [CANCELLATIONS] Starting enhanced cancellations analysis...');
        
        // First, let's check ALL cancellations regardless of date
        const { data: allCancellations, error: allCancError } = await supabase
          .from('subscription_status')
          .select('*')
          .eq('subscription_status', 'Cancelado');

        if (allCancError) {
          console.error('❌ [CANCELLATIONS] Error fetching all cancellations:', allCancError);
        } else {
          console.log('📊 [CANCELLATIONS] Total cancellations in database:', allCancellations?.length || 0);
          if (allCancellations && allCancellations.length > 0) {
            console.log('📅 [CANCELLATIONS] Sample cancellation dates:', 
              allCancellations.slice(0, 3).map(c => ({
                updated_at: c.updated_at,
                created_at: c.created_at,
                canceled_at: c.canceled_at,
                customer_name: c.customer_name
              }))
            );
          }
        }

        // Now check cancellations in the selected date range using updated_at
        let cancellationsQuery = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .eq('subscription_status', 'Cancelado')
          .gte('updated_at', dateRange.from.toISOString())
          .lte('updated_at', dateRange.to.toISOString());

        if (filters.plan !== 'all') {
          cancellationsQuery = cancellationsQuery.eq('plan', filters.plan);
        }

        const { count: cancellationsCount, data: cancellationsData, error: cancellationsError } = await cancellationsQuery;

        console.log('🎯 [CANCELLATIONS] Updated_at filter results:', {
          count: cancellationsCount || 0,
          error: cancellationsError?.message || 'none',
          sampleData: cancellationsData?.slice(0, 2)
        });

        // Also try with canceled_at field if it exists
        const { data: canceledAtData, count: canceledAtCount, error: canceledAtError } = await supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .eq('subscription_status', 'Cancelado')
          .gte('canceled_at', dateRange.from.toISOString())
          .lte('canceled_at', dateRange.to.toISOString());

        console.log('📅 [CANCELLATIONS] Canceled_at filter results:', {
          count: canceledAtCount || 0,
          error: canceledAtError?.message || 'none',
          sampleData: canceledAtData?.slice(0, 2)
        });

        // Use the higher count between the two approaches
        const finalCancellationsCount = Math.max(cancellationsCount || 0, canceledAtCount || 0);

        console.log('✅ [CANCELLATIONS] Final cancellations count:', finalCancellationsCount);

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

        console.log('📈 [SUBSCRIPTION METRICS] Final metrics calculated:', {
          activeSubscriptions: finalMetrics.activeSubscriptions,
          newSubscriptions: finalMetrics.newSubscriptions,
          cancellations: finalMetrics.cancellations,
          mrr: finalMetrics.mrr.toFixed(2),
          churnRate: finalMetrics.churnRate + '%'
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
