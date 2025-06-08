
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionEvents = (
  dateRange: { from: Date; to: Date },
  filters: { plan: string; eventType: string; paymentMethod: string },
  page: number,
  pageSize: number
) => {
  const [events, setEvents] = useState<any[]>([]);
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
