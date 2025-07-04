
import { useState, useEffect, useRef } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track current request and prevent race conditions
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<string>('');

  useEffect(() => {
    const fetchRenewals = async () => {
      try {
        // Cancel previous request if it exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // Generate unique request ID
        const requestId = Date.now().toString();
        requestIdRef.current = requestId;

        setLoading(true);
        setError(null);
        console.log('📊 Fetching subscription renewals...', { requestId });

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        let query = supabase
          .from('subscription_renewals')
          .select('*', { count: 'exact' })
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr)
          .order('created_at', { ascending: false });

        // Apply pagination
        if (pageSize > 0) {
          query = query.range((page - 1) * pageSize, page * pageSize - 1);
        }

        // Apply filters
        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        if (filters.status !== 'all') {
          query = query.eq('subscription_status', filters.status);
        }

        // Search filter
        if (searchTerm.trim()) {
          query = query.or(`customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,subscription_id.ilike.%${searchTerm}%`);
        }

        const { data, error: queryError, count } = await query.abortSignal(abortController.signal);

        // Check if this is still the current request
        if (requestIdRef.current !== requestId) {
          console.log('📊 Request superseded, ignoring response', { requestId });
          return;
        }

        if (queryError) {
          console.error('❌ Error fetching subscription renewals:', queryError);
          setError(queryError.message);
          setRenewals([]);
          setTotalCount(0);
          return;
        }

        const validRenewals = (data || []).filter(renewal => 
          renewal && 
          renewal.created_at && 
          renewal.plan && 
          typeof renewal.amount === 'number'
        );

        setRenewals(validRenewals);
        setTotalCount(count || 0);

        console.log('✅ Subscription renewals loaded:', {
          count: validRenewals.length,
          totalCount: count || 0,
          page,
          pageSize,
          searchTerm,
          requestId,
          dateRange: { from: startDateStr, to: endDateStr }
        });

      } catch (error: any) {
        // Ignore aborted requests
        if (error.name === 'AbortError') {
          console.log('📊 Request aborted', { requestId: requestIdRef.current });
          return;
        }

        console.error('❌ Error fetching subscription renewals:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        setRenewals([]);
        setTotalCount(0);
      } finally {
        // Only set loading to false if this is still the current request
        if (requestIdRef.current === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    // Debounce requests to prevent excessive API calls
    const timeoutId = setTimeout(() => {
      fetchRenewals();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dateRange, filters, page, pageSize, searchTerm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { renewals, loading, totalCount, error };
};
