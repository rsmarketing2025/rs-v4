
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionEvent {
  id: string;
  subscription_id: string;
  event_type: string;
  amount: number;
  plan: string;
  event_date: string;
  customer_id: string;
  customer_email: string;
  customer_name: string | null;
  currency: string;
  frequency: string | null;
  payment_method?: string;
}

interface UseSubscriptionEventsProps {
  dateRange: { from: Date; to: Date };
  filters: { plan: string; eventType: string; paymentMethod: string };
  page: number;
  pageSize: number;
}

export const useSubscriptionEvents = (
  dateRange: UseSubscriptionEventsProps['dateRange'],
  filters: UseSubscriptionEventsProps['filters'],
  page: UseSubscriptionEventsProps['page'],
  pageSize: UseSubscriptionEventsProps['pageSize']
) => {
  const [events, setEvents] = useState<SubscriptionEvent[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from('subscription_events')
          .select('*', { count: 'exact' })
          .gte('event_date', dateRange.from.toISOString())
          .lte('event_date', dateRange.to.toISOString())
          .order('event_date', { ascending: false });

        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }
        if (filters.eventType !== 'all') {
          query = query.eq('event_type', filters.eventType);
        }
        if (filters.paymentMethod !== 'all') {
          query = query.eq('payment_method', filters.paymentMethod);
        }

        // Aplicar paginação
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) {
          console.error('Error fetching subscription events:', error);
        } else {
          setEvents(data || []);
          setTotalCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching subscription events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [dateRange, filters, page, pageSize]);

  return { events, totalCount, loading };
};
