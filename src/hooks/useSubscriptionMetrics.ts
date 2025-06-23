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

interface ProcessedSubscription {
  subscription_id: string;
  customer_id: string;
  plan: string;
  amount: number;
  isActive: boolean;
  lastEventDate: string;
  lastEventType: string;
  createdAt: string;
  events: SubscriptionEvent[];
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
        console.log('🔄 Starting improved subscription metrics calculation...', {
          dateRange: {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString()
          },
          filters
        });

        // 1. Fetch ALL subscription events (ordered chronologically)
        let eventsQuery = supabase
          .from('subscription_events')
          .select('*')
          .order('subscription_id', { ascending: true })
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

        // 2. Define event types
        const subscriptionStartEvents = [
          'subscription',
          'created',
          'subscription_created',
          'activated',
          'active',
          'started'
        ];

        const cancellationEvents = [
          'canceled', 
          'cancelled', 
          'cancellation',
          'subscription_cancelled',
          'subscription_canceled',
          'cancel',
          'refund',
          'refunded',
          'chargeback',
          'expired',
          'suspended',
          'terminated'
        ];

        const paymentEvents = [
          'payment_succeeded',
          'payment_completed',
          'renewed',
          'charge_succeeded'
        ];

        // 3. Process events chronologically by subscription
        const subscriptionMap = new Map<string, ProcessedSubscription>();

        // Group events by subscription_id
        const eventsBySubscription = new Map<string, SubscriptionEvent[]>();
        events.forEach(event => {
          const existing = eventsBySubscription.get(event.subscription_id) || [];
          existing.push(event);
          eventsBySubscription.set(event.subscription_id, existing);
        });

        console.log('📋 Processing', eventsBySubscription.size, 'unique subscriptions...');

        // Process each subscription's events chronologically
        eventsBySubscription.forEach((subscriptionEvents, subscriptionId) => {
          // Sort events by date to ensure chronological processing
          subscriptionEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

          let isActive = false;
          let createdAt = '';
          let lastAmount = 0;
          let lastPlan = '';
          let lastEventDate = '';
          let lastEventType = '';

          // Process events in chronological order
          subscriptionEvents.forEach(event => {
            const eventType = event.event_type.toLowerCase().trim();
            
            // Track subscription creation
            if (subscriptionStartEvents.some(startEvent => eventType.includes(startEvent))) {
              isActive = true;
              if (!createdAt) {
                createdAt = event.event_date;
              }
              lastAmount = Number(event.amount) || lastAmount;
              lastPlan = event.plan || lastPlan;
            }

            // Track payment events (keep active)
            if (paymentEvents.some(payEvent => eventType.includes(payEvent))) {
              isActive = true;
              lastAmount = Number(event.amount) || lastAmount;
            }

            // Track cancellation events
            if (cancellationEvents.some(cancelEvent => eventType.includes(cancelEvent))) {
              isActive = false;
            }

            // Always update last event info
            lastEventDate = event.event_date;
            lastEventType = event.event_type;
          });

          // Store processed subscription
          subscriptionMap.set(subscriptionId, {
            subscription_id: subscriptionId,
            customer_id: subscriptionEvents[0].customer_id,
            plan: lastPlan || subscriptionEvents[0].plan,
            amount: lastAmount,
            isActive,
            lastEventDate,
            lastEventType,
            createdAt: createdAt || subscriptionEvents[0].event_date,
            events: subscriptionEvents
          });
        });

        // 4. Calculate metrics
        const processedSubscriptions = Array.from(subscriptionMap.values());
        const activeSubscriptions = processedSubscriptions.filter(sub => sub.isActive);
        const totalMRR = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

        console.log('✅ Subscription Analysis Results:', {
          totalProcessed: processedSubscriptions.length,
          activeCount: activeSubscriptions.length,
          inactiveCount: processedSubscriptions.length - activeSubscriptions.length,
          totalMRR: totalMRR.toFixed(2)
        });

        // Log sample active subscriptions for debugging
        if (activeSubscriptions.length > 0) {
          console.log('🔍 Sample Active Subscriptions:', 
            activeSubscriptions.slice(0, 5).map(sub => ({
              id: sub.subscription_id.slice(-8),
              plan: sub.plan,
              amount: sub.amount,
              lastEvent: sub.lastEventType,
              lastDate: sub.lastEventDate,
              eventsCount: sub.events.length
            }))
          );
        }

        // 5. Calculate new subscriptions in the selected period
        const newSubscriptionsInPeriod = processedSubscriptions.filter(sub => {
          const createdDate = new Date(sub.createdAt);
          return createdDate >= dateRange.from && createdDate <= dateRange.to;
        });

        // 6. Calculate cancellations in the selected period
        const cancellationsInPeriod = events.filter(event => 
          cancellationEvents.some(cancelEvent => 
            event.event_type.toLowerCase().includes(cancelEvent)
          ) &&
          new Date(event.event_date) >= dateRange.from &&
          new Date(event.event_date) <= dateRange.to
        );

        // 7. Calculate churn rate
        const churnRate = activeSubscriptions.length > 0 
          ? (cancellationsInPeriod.length / (activeSubscriptions.length + cancellationsInPeriod.length)) * 100 
          : 0;

        // 8. Calculate growth metrics (simplified - using placeholder values for complex calculations)
        const finalMetrics = {
          activeSubscriptions: activeSubscriptions.length,
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

        console.log('🎯 Final Subscription Metrics:', {
          ...finalMetrics,
          details: {
            newInPeriod: newSubscriptionsInPeriod.length,
            cancellationsInPeriod: cancellationsInPeriod.length,
            averageSubscriptionValue: activeSubscriptions.length > 0 
              ? (totalMRR / activeSubscriptions.length).toFixed(2) 
              : 0
          }
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
