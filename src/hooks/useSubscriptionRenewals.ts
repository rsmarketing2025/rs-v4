
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface SubscriptionRenewal {
  id: string;
  subscription_id: string;
  customer_id: string;
  customer_email: string;
  customer_name: string | null;
  plan: string;
  amount: number;
  currency: string;
  frequency: string | null;
  renewal_date: string;
  payment_method: string | null;
  status: string;
  gross_value: number;
  net_value: number;
  discount_value: number | null;
  tax_value: number | null;
  commission_value: number | null;
  subscription_number: number | null;
  renewal_period_start: string | null;
  renewal_period_end: string | null;
  previous_renewal_id: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface Filters {
  plan: string;
  eventType: string;
  paymentMethod: string;
  status: string;
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
          .gte('renewal_date', startDateStr)
          .lte('renewal_date', endDateStr)
          .order('renewal_date', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        // Apply filters
        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        if (filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters.paymentMethod !== 'all') {
          query = query.eq('payment_method', filters.paymentMethod);
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
          searchTerm
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
