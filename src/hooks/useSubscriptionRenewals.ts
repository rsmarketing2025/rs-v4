
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface SubscriptionRenewal {
  id: string;
  subscription_id: string | null;
  customer_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  plan: string;
  amount: number;
  currency: string;
  frequency: string | null;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  canceled_at: string | null;
  subscription_number: number | null;
}

interface Filters {
  plan: string;
  eventType: string;
  paymentMethod: string;
  status: string;
  products: string[];
}

interface DateRange {
  from: Date;
  to: Date;
}

export const useSubscriptionRenewals = (
  dateRange: DateRange,
  filters: Filters,
  page: number,
  pageSize: number,
  searchTerm: string = ''
) => {
  const [renewals, setRenewals] = useState<SubscriptionRenewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchRenewals = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching subscription renewals...');

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        let query = supabase
          .from('subscription_renewals')
          .select('*', { count: 'exact' })
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr)
          .order('created_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        // Apply plan filter
        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        // Apply products filter if products are selected
        if (filters.products.length > 0) {
          query = query.in('plan', filters.products);
          console.log('📊 [RENEWALS TABLE] Applying products filter:', filters.products);
        }

        // Apply status filter
        if (filters.status !== 'all') {
          query = query.eq('subscription_status', filters.status);
        }

        // Search filter
        if (searchTerm.trim()) {
          query = query.or(`customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,subscription_id.ilike.%${searchTerm}%`);
        }

        const { data, error, count } = await query;

        if (error) {
          console.error('❌ Error fetching subscription renewals:', error);
          return;
        }

        setRenewals(data || []);
        setTotalCount(count || 0);

        console.log('✅ Subscription renewals loaded:', {
          count: data?.length || 0,
          totalCount: count || 0,
          page,
          pageSize,
          searchTerm,
          productsFilter: filters.products.length > 0 ? filters.products : 'none'
        });

      } catch (error) {
        console.error('❌ Error fetching subscription renewals:', error);
        setRenewals([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRenewals();
  }, [dateRange, filters, page, pageSize, searchTerm]);

  return { renewals, loading, totalCount };
};
