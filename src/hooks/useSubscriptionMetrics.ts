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
        console.log('🔄 Starting corrected subscription metrics calculation...');

        // Buscar TODOS os eventos de assinatura
        let eventsQuery = supabase
          .from('subscription_events')
          .select('*')
          .order('event_date', { ascending: true });

        // Aplicar filtro de plano se especificado
        if (filters.plan !== 'all') {
          eventsQuery = eventsQuery.eq('plan', filters.plan);
        }

        const { data: allEvents, error: eventsError } = await eventsQuery;

        if (eventsError) {
          console.error('❌ Error fetching events:', eventsError);
          return;
        }

        const events = (allEvents || []) as SubscriptionEvent[];
        console.log('📊 Total events fetched:', events.length);

        // Implementar lógica CORRETA:
        // 1. Encontrar todos os customer_id únicos com evento 'subscription'
        // 2. Para cada customer_id, verificar se tem evento 'canceled'
        // 3. Se tem 'subscription' mas NÃO tem 'canceled', contar como ativo

        const customersWithSubscription = new Set<string>();
        const customersWithCancellation = new Set<string>();
        const subscriptionAmounts = new Map<string, number>();
        
        // Processar todos os eventos
        events.forEach(event => {
          const eventType = event.event_type.toLowerCase().trim();
          
          // Identificar eventos de assinatura
          if (eventType === 'subscription' || eventType === 'created' || eventType === 'subscription_created') {
            customersWithSubscription.add(event.customer_id);
            // Armazenar o valor da assinatura (pegar o último valor)
            subscriptionAmounts.set(event.customer_id, Number(event.amount) || 0);
          }
          
          // Identificar eventos de cancelamento
          if (eventType === 'canceled' || eventType === 'cancelled' || eventType === 'cancellation') {
            customersWithCancellation.add(event.customer_id);
          }
        });

        // Calcular assinaturas ativas: clientes com subscription MAS SEM cancelamento
        const activeCustomers = Array.from(customersWithSubscription).filter(
          customerId => !customersWithCancellation.has(customerId)
        );

        const activeSubscriptionsCount = activeCustomers.length;
        
        // Calcular MRR total
        const totalMRR = activeCustomers.reduce((sum, customerId) => {
          return sum + (subscriptionAmounts.get(customerId) || 0);
        }, 0);

        console.log('✅ Subscription Analysis Results:', {
          totalCustomersWithSubscription: customersWithSubscription.size,
          totalCustomersWithCancellation: customersWithCancellation.size,
          activeSubscriptions: activeSubscriptionsCount,
          totalMRR: totalMRR.toFixed(2)
        });

        // Calcular novas assinaturas no período
        const newSubscriptionsInPeriod = events.filter(event => {
          const eventType = event.event_type.toLowerCase().trim();
          const eventDate = new Date(event.event_date);
          return (eventType === 'subscription' || eventType === 'created' || eventType === 'subscription_created') &&
                 eventDate >= dateRange.from && eventDate <= dateRange.to;
        });

        // Calcular cancelamentos no período
        const cancellationsInPeriod = events.filter(event => {
          const eventType = event.event_type.toLowerCase().trim();
          const eventDate = new Date(event.event_date);
          return (eventType === 'canceled' || eventType === 'cancelled' || eventType === 'cancellation') &&
                 eventDate >= dateRange.from && eventDate <= dateRange.to;
        });

        // Calcular taxa de churn
        const churnRate = activeSubscriptionsCount > 0 
          ? (cancellationsInPeriod.length / (activeSubscriptionsCount + cancellationsInPeriod.length)) * 100 
          : 0;

        const finalMetrics = {
          activeSubscriptions: activeSubscriptionsCount,
          activeSubscriptionsGrowth: 15.2, // Placeholder
          newSubscriptions: newSubscriptionsInPeriod.length,
          newSubscriptionsGrowth: 8.5, // Placeholder
          cancellations: cancellationsInPeriod.length,
          cancellationsGrowth: -5.3, // Placeholder
          mrr: totalMRR,
          mrrGrowth: 12.3, // Placeholder
          churnRate: parseFloat(churnRate.toFixed(1)),
          churnRateChange: -2.1 // Placeholder
        };

        setMetrics(finalMetrics);

        console.log('🎯 Final Corrected Metrics:', {
          activeSubscriptions: activeSubscriptionsCount,
          newInPeriod: newSubscriptionsInPeriod.length,
          cancellationsInPeriod: cancellationsInPeriod.length,
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
