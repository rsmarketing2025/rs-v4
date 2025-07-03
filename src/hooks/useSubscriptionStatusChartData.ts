
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface ChartFilters {
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

interface SubscriptionStatusDataItem {
  date: string;
  plan: string;
  subscription_status: string;
  amount: number;
}

export const useSubscriptionStatusChartData = (
  dateRange: DateRange,
  filters: ChartFilters
) => {
  const [chartData, setChartData] = useState<SubscriptionStatusDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatusData = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching subscription status chart data...');

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        // First, get all available products to determine if all are selected
        const { data: allProducts, error: productsError } = await supabase
          .from('subscription_status')
          .select('plan')
          .not('plan', 'is', null)
          .not('plan', 'eq', '');

        if (productsError) {
          console.error('❌ [SUBSCRIPTION STATUS CHART] Error fetching all products:', productsError);
        }

        const uniqueProducts = [...new Set((allProducts || []).map(p => p.plan))];
        console.log('📊 [SUBSCRIPTION STATUS CHART] Available products:', uniqueProducts);
        console.log('📊 [SUBSCRIPTION STATUS CHART] Selected products:', filters.products);

        // Determine if product filter should be applied
        const shouldApplyProductFilter = filters.products.length > 0 && 
                                       filters.products.length < uniqueProducts.length;

        console.log('📊 [SUBSCRIPTION STATUS CHART] Filter logic:', {
          productsSelected: filters.products.length,
          totalProducts: uniqueProducts.length,
          shouldApplyProductFilter,
          allProductsSelected: filters.products.length === uniqueProducts.length
        });

        let query = supabase
          .from('subscription_status')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        // Apply plan filter
        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        // Apply status filter
        if (filters.status !== 'all') {
          query = query.eq('subscription_status', filters.status);
        }

        // Apply product filter only if not all products are selected
        if (shouldApplyProductFilter) {
          query = query.in('plan', filters.products);
          console.log('📊 [SUBSCRIPTION STATUS CHART] Applying products filter:', filters.products);
        } else {
          console.log('📊 [SUBSCRIPTION STATUS CHART] Not applying products filter (all products selected or none)');
        }

        const { data: subscriptionStatuses, error } = await query;

        if (error) {
          console.error('❌ Error fetching subscription status:', error);
          return;
        }

        if (subscriptionStatuses) {
          const chartData: SubscriptionStatusDataItem[] = subscriptionStatuses.map(status => ({
            date: status.created_at,
            plan: status.plan || 'Unknown',
            subscription_status: status.subscription_status || 'Unknown',
            amount: status.amount || 0
          }));

          setChartData(chartData);
        }

        console.log('✅ Subscription status chart data loaded:', {
          count: chartData.length,
          filterApplied: shouldApplyProductFilter ? 'YES' : 'NO',
          productsFilter: shouldApplyProductFilter ? filters.products : 'none (all products selected or none selected)'
        });

      } catch (error) {
        console.error('❌ Error fetching subscription status chart data:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatusData();
  }, [dateRange, filters]);

  return { chartData, loading };
};
