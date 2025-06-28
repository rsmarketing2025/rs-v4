
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

        let query = supabase
          .from('subscription_renewals')
          .select('*')
          .gte('renewal_date', startDateStr)
          .lte('renewal_date', endDateStr)
          .eq('status', 'completed');

        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        if (filters.paymentMethod !== 'all') {
          query = query.eq('payment_method', filters.paymentMethod);
        }

        const { data: renewals, error } = await query;

        if (error) {
          console.error('❌ [RENEWAL METRICS] Error fetching renewals:', error);
          return;
        }

        console.log('📊 [RENEWAL METRICS] Renewals fetched:', renewals?.length || 0);

        if (renewals) {
          const totalRenewals = renewals.length;
          const totalRenewalRevenue = renewals.reduce((sum, renewal) => sum + (renewal.net_value || 0), 0);
          const averageRenewalValue = totalRenewals > 0 ? totalRenewalRevenue / totalRenewals : 0;

          // Group by plan
          const renewalsByPlan: Record<string, number> = {};
          const renewalRevenueByPlan: Record<string, number> = {};

          renewals.forEach(renewal => {
            const plan = renewal.plan || 'Unknown';
            renewalsByPlan[plan] = (renewalsByPlan[plan] || 0) + 1;
            renewalRevenueByPlan[plan] = (renewalRevenueByPlan[plan] || 0) + (renewal.net_value || 0);
          });

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
