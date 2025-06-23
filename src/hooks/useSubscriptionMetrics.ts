
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
        console.log('🔄 Implementing corrected subscription metrics calculation...');

        // Fetch ALL subscription events
        let eventsQuery = supabase
          .from('subscription_events')
          .select('*')
          .order('event_date', { ascending: true });

        // Apply plan filter if specified
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

        // CORRECTED LOGIC:
        // 1. Find all customer_id with 'subscription' event
        // 2. For each customer_id, check if they have 'canceled' event
        // 3. If has 'subscription' but NOT 'canceled', count as active

        const customersWithSubscription = new Set<string>();
        const customersWithCancellation = new Set<string>();
        const subscriptionAmounts = new Map<string, number>();
        
        // Process all events to identify customers with subscriptions and cancellations
        events.forEach(event => {
          const eventType = event.event_type.toLowerCase().trim();
          
          // Identify subscription events
          if (eventType === 'subscription' || eventType === 'created' || eventType === 'subscription_created') {
            customersWithSubscription.add(event.customer_id);
            // Store subscription amount (use latest value)
            subscriptionAmounts.set(event.customer_id, Number(event.amount) || 0);
          }
          
          // Identify cancellation events
          if (eventType === 'canceled' || eventType === 'cancelled' || eventType === 'cancellation') {
            customersWithCancellation.add(event.customer_id);
          }
        });

        // Calculate active subscriptions: customers with subscription BUT WITHOUT cancellation
        const activeCustomers = Array.from(customersWithSubscription).filter(
          customerId => !customersWithCancellation.has(customerId)
        );

        const activeSubscriptionsCount = activeCustomers.length;
        
        // Calculate total MRR from active customers
        const totalMRR = activeCustomers.reduce((sum, customerId) => {
          return sum + (subscriptionAmounts.get(customerId) || 0);
        }, 0);

        console.log('✅ CORRECTED Subscription Analysis Results:', {
          totalCustomersWithSubscription: customersWithSubscription.size,
          totalCustomersWithCancellation: customersWithCancellation.size,
          activeSubscriptions: activeSubscriptionsCount,
          totalMRR: totalMRR.toFixed(2)
        });

        // Calculate new subscriptions in the period
        const newSubscriptionsInPeriod = events.filter(event => {
          const eventType = event.event_type.toLowerCase().trim();
          const eventDate = new Date(event.event_date);
          return (eventType === 'subscription' || eventType === 'created' || eventType === 'subscription_created') &&
                 eventDate >= dateRange.from && eventDate <= dateRange.to;
        });

        // Calculate cancellations in the period
        const cancellationsInPeriod = events.filter(event => {
          const eventType = event.event_type.toLowerCase().trim();
          const eventDate = new Date(event.event_date);
          return (eventType === 'canceled' || eventType === 'cancelled' || eventType === 'cancellation') &&
                 eventDate >= dateRange.from && eventDate <= dateRange.to;
        });

        // Calculate churn rate
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

        console.log('🎯 Final CORRECTED Metrics:', {
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
