
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionMetrics {
  activeSubscriptions: number;
  activeSubscriptionsGrowth: number;
  newSubscriptions: number;
  newSubscriptionsGrowth: number;
  mrr: number;
  mrrGrowth: number;
  churnRate: number;
  churnRateChange: number;
  averageLTV: number;
  ltvGrowth: number;
  retention30d: number;
  retentionChange: number;
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
    mrr: 0,
    mrrGrowth: 0,
    churnRate: 0,
    churnRateChange: 0,
    averageLTV: 0,
    ltvGrowth: 0,
    retention30d: 0,
    retentionChange: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);

        // Build query with proper typing
        let query = supabase
          .from('subscription_events')
          .select('*')
          .gte('event_date', dateRange.from.toISOString())
          .lte('event_date', dateRange.to.toISOString());

        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }
        if (filters.eventType !== 'all') {
          query = query.eq('event_type', filters.eventType);
        }
        if (filters.paymentMethod !== 'all') {
          query = query.eq('payment_method', filters.paymentMethod);
        }

        const { data: events } = await query;

        if (events) {
          // Calcular métricas principais
          const subscriptions = events.filter(e => e.event_type === 'subscription');
          const cancellations = events.filter(e => e.event_type === 'cancellation');
          
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
          
          // LTV estimado (valor médio * 12 meses / taxa de churn mensal)
          const avgAmount = subscriptions.length > 0 ? monthlyRevenue / subscriptions.length : 0;
          const averageLTV = churnRate > 0 ? (avgAmount * 12) / (churnRate / 100) : avgAmount * 12;
          
          // Retenção simplificada (90% para exemplo)
          const retention30d = 90;

          setMetrics({
            activeSubscriptions,
            activeSubscriptionsGrowth: 15.2, // Mock growth
            newSubscriptions,
            newSubscriptionsGrowth: 8.7, // Mock growth
            mrr: monthlyRevenue,
            mrrGrowth: 12.3, // Mock growth
            churnRate,
            churnRateChange: -2.1, // Mock change
            averageLTV,
            ltvGrowth: 5.8, // Mock growth
            retention30d,
            retentionChange: 2.4 // Mock change
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
