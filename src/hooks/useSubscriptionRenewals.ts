
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface RenewalFilters {
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

interface SubscriptionRenewal {
  id: string;
  subscription_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  plan: string;
  amount: number;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  canceled_at: string | null;
  subscription_number: number | null; // Add this property
}

export const useSubscriptionRenewals = (
  dateRange: DateRange,
  filters: RenewalFilters,
  searchTerm: string = ''
) => {
  const [renewals, setRenewals] = useState<SubscriptionRenewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0); // Add totalCount

  useEffect(() => {
    const fetchRenewals = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching subscription renewals with filters:', filters);

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        let query = supabase
          .from('subscription_renewals')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr)
          .order('created_at', { ascending: false });

        // Apply status filter
        if (filters.status !== 'all') {
          if (filters.status === 'active') {
            query = query.eq('subscription_status', 'active');
          } else if (filters.status === 'canceled') {
            query = query.eq('subscription_status', 'canceled');
          } else if (filters.status === 'expired') {
            query = query.eq('subscription_status', 'expired');
          }
        }

        // Apply product filter
        if (filters.products.length > 0) {
          console.log('🔍 Applying product filter to renewals table:', filters.products);
          query = query.in('plan', filters.products);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error fetching renewals:', error);
          throw error;
        }

        let filteredData = data || [];

        // Apply search filter - make sure searchTerm is a string
        if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          filteredData = filteredData.filter(renewal =>
            renewal.customer_name?.toLowerCase().includes(searchLower) ||
            renewal.customer_email?.toLowerCase().includes(searchLower) ||
            renewal.subscription_id?.toLowerCase().includes(searchLower) ||
            renewal.plan?.toLowerCase().includes(searchLower)
          );
        }

        setRenewals(filteredData);
        setTotalCount(filteredData.length);
        
        console.log('✅ Renewals loaded:', {
          total: filteredData.length,
          filtersApplied: {
            status: filters.status,
            products: filters.products.length > 0 ? filters.products : 'none',
            search: searchTerm || 'none'
          }
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('❌ Error in useSubscriptionRenewals:', errorMessage);
        setError(errorMessage);
        setRenewals([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRenewals();
  }, [dateRange, filters, searchTerm]);

  return { renewals, loading, error, totalCount };
};
