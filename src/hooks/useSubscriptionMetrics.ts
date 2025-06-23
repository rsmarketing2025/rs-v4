
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
        console.log('📊 Fetching subscription metrics from subscription_status table...');

        // 1. Get active subscriptions from subscription_status table (using Portuguese "Ativo")
        let activeQuery = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .eq('subscription_status', 'Ativo');

        if (filters.plan !== 'all') {
          activeQuery = activeQuery.eq('plan', filters.plan);
        }

        const { count: activeCount, data: activeSubscriptions } = await activeQuery;

        // Calculate total MRR from active subscriptions
        const totalMRR = (activeSubscriptions || []).reduce((sum, sub) => {
          return sum + (Number(sub.amount) || 0);
        }, 0);

        // 2. Get new subscriptions in the period from subscription_events (simplified to 'subscription')
        let newSubsQuery = supabase
          .from('subscription_events')
          .select('*', { count: 'exact' })
          .eq('event_type', 'subscription')
          .gte('event_date', dateRange.from.toISOString())
          .lte('event_date', dateRange.to.toISOString());

        if (filters.plan !== 'all') {
          newSubsQuery = newSubsQuery.eq('plan', filters.plan);
        }

        const { count: newSubscriptionsCount } = await newSubsQuery;

        // 3. Get cancellations in the period from subscription_events (simplified to 'canceled')
        let cancellationsQuery = supabase
          .from('subscription_events')
          .select('*', { count: 'exact' })
          .eq('event_type', 'canceled')
          .gte('event_date', dateRange.from.toISOString())
          .lte('event_date', dateRange.to.toISOString());

        if (filters.plan !== 'all') {
          cancellationsQuery = cancellationsQuery.eq('plan', filters.plan);
        }

        const { count: cancellationsCount } = await cancellationsQuery;

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

        setMetrics(finalMetrics);

        console.log('✅ Subscription Metrics updated:', {
          activeSubscriptions: activeCount || 0,
          newInPeriod: newSubscriptionsCount || 0,
          cancellationsInPeriod: cancellationsCount || 0,
          mrr: totalMRR.toFixed(2),
          churnRate: churnRate.toFixed(1) + '%'
        });

      } catch (error) {
        console.error('❌ Error calculating subscription metrics:', error);
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
