
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

interface SubscriptionEvent {
  subscription_id: string;
  event_type: string;
  amount: number;
  plan: string;
  event_date: string;
  customer_id: string;
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

        // 1. Buscar NOVAS assinaturas no período selecionado (com filtro de data)
        let newSubscriptionsQuery = supabase
          .from('subscription_events')
          .select('*')
          .eq('event_type', 'subscription')
          .gte('event_date', dateRange.from.toISOString())
          .lte('event_date', dateRange.to.toISOString());

        // Aplicar filtros nas novas assinaturas
        if (filters.plan !== 'all') {
          newSubscriptionsQuery = newSubscriptionsQuery.eq('plan', filters.plan);
        }

        const { data: newSubscriptionsData, error: newSubsError } = await newSubscriptionsQuery;

        if (newSubsError) {
          console.error('Error fetching new subscriptions:', newSubsError);
          return;
        }

        // 2. Buscar TODOS os eventos históricos (sem filtro de data)
        let allEventsQuery = supabase
          .from('subscription_events')
          .select('subscription_id, event_type, amount, plan, event_date, customer_id');

        // Aplicar filtros nos eventos históricos
        if (filters.plan !== 'all') {
          allEventsQuery = allEventsQuery.eq('plan', filters.plan);
        }

        const { data: allEventsData, error: allEventsError } = await allEventsQuery;

        if (allEventsError) {
          console.error('Error fetching all events:', allEventsError);
          return;
        }

        const allEvents = (allEventsData || []) as SubscriptionEvent[];

        // 3. Calcular assinaturas ATIVAS
        const subscriptionMap = new Map<string, { hasSubscription: boolean; hasCancellation: boolean; amount: number }>();

        allEvents.forEach(event => {
          const existing = subscriptionMap.get(event.subscription_id) || { 
            hasSubscription: false, 
            hasCancellation: false, 
            amount: 0 
          };

          if (event.event_type === 'subscription') {
            existing.hasSubscription = true;
            existing.amount = Number(event.amount) || 0;
          } else if (event.event_type === 'canceled' || event.event_type === 'cancellation') {
            existing.hasCancellation = true;
          }

          subscriptionMap.set(event.subscription_id, existing);
        });

        // Contar assinaturas ativas (tem subscription mas não tem cancelamento)
        let activeCount = 0;
        let totalMRR = 0;

        subscriptionMap.forEach(subscription => {
          if (subscription.hasSubscription && !subscription.hasCancellation) {
            activeCount++;
            totalMRR += subscription.amount;
          }
        });

        // 4. Calcular cancelamentos no período
        const cancellationsInPeriod = allEvents.filter(event => 
          (event.event_type === 'canceled' || event.event_type === 'cancellation') &&
          new Date(event.event_date) >= dateRange.from &&
          new Date(event.event_date) <= dateRange.to
        ).length;

        // 5. Calcular taxa de churn
        const churnRate = activeCount > 0 ? (cancellationsInPeriod / activeCount) * 100 : 0;

        // 6. Definir métricas calculadas
        const newSubscriptions = (newSubscriptionsData || []).length;

        setMetrics({
          activeSubscriptions: activeCount,
          activeSubscriptionsGrowth: 15.2, // Valor fixo temporário
          newSubscriptions,
          newSubscriptionsGrowth: 8.7, // Valor fixo temporário
          cancellations: cancellationsInPeriod,
          cancellationsGrowth: -5.3, // Valor fixo temporário
          mrr: totalMRR,
          mrrGrowth: 12.3, // Valor fixo temporário
          churnRate,
          churnRateChange: -2.1 // Valor fixo temporário
        });

        console.log('Subscription metrics calculated:', {
          activeSubscriptions: activeCount,
          newSubscriptions,
          cancellations: cancellationsInPeriod,
          mrr: totalMRR,
          churnRate
        });

      } catch (error) {
        console.error('Error fetching subscription metrics:', error);
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
