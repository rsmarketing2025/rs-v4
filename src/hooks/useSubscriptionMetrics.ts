
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

        // Build base query
        let query = supabase
          .from('subscription_events')
          .select('*')
          .gte('event_date', dateRange.from.toISOString())
          .lte('event_date', dateRange.to.toISOString());

        // Apply filters conditionally
        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }
        if (filters.eventType !== 'all') {
          query = query.eq('event_type', filters.eventType);
        }
        if (filters.paymentMethod !== 'all') {
          query = query.eq('payment_method', filters.paymentMethod);
        }

        const { data: events, error } = await query;

        if (error) {
          console.error('Error fetching subscription events:', error);
          return;
        }

        if (events && events.length > 0) {
          // Calcular métricas principais
          const subscriptions = events.filter(e => e.event_type === 'subscription');
          const cancellations = events.filter(e => e.event_type === 'canceled');
          
          const newSubscriptions = subscriptions.length;
          const totalCancellations = cancellations.length;
          
          // Estimar assinaturas ativas (simplificado)
          const activeSubscriptions = Math.max(0, newSubscriptions - totalCancellations);
          
          // Calcular MRR usando 'amount' em vez de 'value'
          const monthlyRevenue = subscriptions.reduce((sum, sub) => {
            return sum + (sub.amount || 0);
          }, 0);
          
          // Calcular taxa de churn
          const churnRate = activeSubscriptions > 0 ? (totalCancellations / activeSubscriptions) * 100 : 0;

          setMetrics({
            activeSubscriptions,
            activeSubscriptionsGrowth: 15.2, // Mock growth
            newSubscriptions,
            newSubscriptionsGrowth: 8.7, // Mock growth
            cancellations: totalCancellations,
            cancellationsGrowth: -5.3, // Mock growth (negative is good for cancellations)
            mrr: monthlyRevenue,
            mrrGrowth: 12.3, // Mock growth
            churnRate,
            churnRateChange: -2.1 // Mock change
          });
        }
      } catch (error) {
        console.error('Error fetching subscription metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange, filters]);

  return { metrics, loading };
};
