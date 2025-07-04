
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDateRangeForQuery } from '@/lib/dateUtils';

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

        // Use standardized date formatting
        const { startDateStr, endDateStr } = formatDateRangeForQuery(dateRange);

        console.log('📊 [RENEWAL METRICS] Date range (standardized):', { startDateStr, endDateStr });

        let query = supabase
          .from('subscription_renewals')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        // Only filter by plan if it's not 'all'
        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
          console.log('📊 [RENEWAL METRICS] Filtering by plan:', filters.plan);
        }

        // Remove the problematic subscription_status filter since the data uses 'renovação' not 'active'
        // We'll fetch all renewals and let the data speak for itself
        console.log('📊 [RENEWAL METRICS] Fetching all renewals without status filter...');

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
            planBreakdown: Object.keys(renewalsByPlan).length
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
