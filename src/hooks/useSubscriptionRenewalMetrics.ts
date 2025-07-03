
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface RenewalMetrics {
  totalRenewals: number;
  totalRenewalRevenue: number;
  averageRenewalValue: number;
  renewalsByPlan: Record<string, number>;
  renewalRevenueByPlan: Record<string, number>;
  renewalGrowth: number;
  revenueGrowth: number;
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

export const useSubscriptionRenewalMetrics = (
  dateRange: DateRange,
  filters: Filters
) => {
  const [metrics, setMetrics] = useState<RenewalMetrics>({
    totalRenewals: 0,
    totalRenewalRevenue: 0,
    averageRenewalValue: 0,
    renewalsByPlan: {},
    renewalRevenueByPlan: {},
    renewalGrowth: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        console.log('📊 [RENEWAL METRICS] Starting to fetch renewal metrics...');

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        console.log('📊 [RENEWAL METRICS] Date range:', { startDateStr, endDateStr });

        // First, get all available products to determine if all are selected
        const { data: allProducts, error: productsError } = await supabase
          .from('subscription_renewals')
          .select('plan')
          .not('plan', 'is', null)
          .not('plan', 'eq', '');

        if (productsError) {
          console.error('❌ [RENEWAL METRICS] Error fetching all products:', productsError);
        }

        const uniqueProducts = [...new Set((allProducts || []).map(p => p.plan))];
        console.log('📊 [RENEWAL METRICS] Available products:', uniqueProducts);
        console.log('📊 [RENEWAL METRICS] Selected products:', filters.products);

        // Determine if product filter should be applied
        // If no products selected OR all products selected, don't apply filter
        const shouldApplyProductFilter = filters.products.length > 0 && 
                                       filters.products.length < uniqueProducts.length;

        console.log('📊 [RENEWAL METRICS] Filter logic:', {
          productsSelected: filters.products.length,
          totalProducts: uniqueProducts.length,
          shouldApplyProductFilter,
          allProductsSelected: filters.products.length === uniqueProducts.length
        });

        let query = supabase
          .from('subscription_renewals')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        // Apply plan filter if specified
        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
          console.log('📊 [RENEWAL METRICS] Filtering by plan:', filters.plan);
        }

        // Apply product filter only if not all products are selected
        if (shouldApplyProductFilter) {
          query = query.in('plan', filters.products);
          console.log('📊 [RENEWAL METRICS] Applying product filter:', filters.products);
        } else {
          console.log('📊 [RENEWAL METRICS] Not applying product filter (all products selected or none)');
        }

        console.log('📊 [RENEWAL METRICS] Fetching renewals with filters...');

        const { data: renewals, error } = await query;

        if (error) {
          console.error('❌ [RENEWAL METRICS] Error fetching renewals:', error);
          return;
        }

        console.log('📊 [RENEWAL METRICS] Raw renewals data:', renewals);
        console.log('📊 [RENEWAL METRICS] Renewals fetched:', renewals?.length || 0);

        if (renewals) {
          // Log the subscription statuses we have
          const statuses = [...new Set(renewals.map(r => r.subscription_status))];
          console.log('📊 [RENEWAL METRICS] Available subscription statuses:', statuses);

          const totalRenewals = renewals.length;
          const totalRenewalRevenue = renewals.reduce((sum, renewal) => sum + (renewal.amount || 0), 0);
          const averageRenewalValue = totalRenewals > 0 ? totalRenewalRevenue / totalRenewals : 0;

          // Group by plan
          const renewalsByPlan: Record<string, number> = {};
          const renewalRevenueByPlan: Record<string, number> = {};

          renewals.forEach(renewal => {
            const plan = renewal.plan || 'Unknown';
            renewalsByPlan[plan] = (renewalsByPlan[plan] || 0) + 1;
            renewalRevenueByPlan[plan] = (renewalRevenueByPlan[plan] || 0) + (renewal.amount || 0);
          });

          console.log('📊 [RENEWAL METRICS] Plan breakdown:', renewalsByPlan);
          console.log('📊 [RENEWAL METRICS] Revenue breakdown:', renewalRevenueByPlan);

          setMetrics({
            totalRenewals,
            totalRenewalRevenue,
            averageRenewalValue,
            renewalsByPlan,
            renewalRevenueByPlan,
            renewalGrowth: 12.5, // Placeholder for growth calculation
            revenueGrowth: 8.3   // Placeholder for growth calculation
          });

          console.log('✅ [RENEWAL METRICS] Metrics calculated:', {
            totalRenewals,
            totalRenewalRevenue: totalRenewalRevenue.toFixed(2),
            averageRenewalValue: averageRenewalValue.toFixed(2),
            planBreakdown: Object.keys(renewalsByPlan).length,
            filterApplied: shouldApplyProductFilter ? 'YES' : 'NO',
            productsFilter: shouldApplyProductFilter ? filters.products : 'none (all products or none selected)'
          });
        }

      } catch (error) {
        console.error('❌ [RENEWAL METRICS] Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange, filters]);

  return { metrics, loading };
};
