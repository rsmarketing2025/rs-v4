
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

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

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

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

        // Convert to Brazil timezone
        const startDate = toZonedTime(startOfDay(dateRange.from), BRAZIL_TIMEZONE);
        const endDate = toZonedTime(endOfDay(dateRange.to), BRAZIL_TIMEZONE);
        
        // Convert back to UTC for the query
        const startDateUTC = fromZonedTime(startDate, BRAZIL_TIMEZONE);
        const endDateUTC = fromZonedTime(endDate, BRAZIL_TIMEZONE);
        
        const startDateStr = format(startDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        console.log('📊 [RENEWAL METRICS] Date range:', { startDateStr, endDateStr });

        // Calculate previous period for growth comparison
        const daysDiff = Math.ceil((endDateUTC.getTime() - startDateUTC.getTime()) / (1000 * 60 * 60 * 24));
        const prevStartDate = subDays(startDateUTC, daysDiff);
        const prevEndDate = subDays(endDateUTC, daysDiff);
        const prevStartDateStr = format(prevStartDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const prevEndDateStr = format(prevEndDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

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

        let prevQuery = supabase
          .from('subscription_renewals')
          .select('*')
          .gte('created_at', prevStartDateStr)
          .lte('created_at', prevEndDateStr);

        if (filters.plan !== 'all') {
          prevQuery = prevQuery.eq('plan', filters.plan);
        }

        const [renewalsResult, prevRenewalsResult] = await Promise.all([
          query,
          prevQuery
        ]);

        if (renewalsResult.error) {
          console.error('❌ [RENEWAL METRICS] Error fetching renewals:', renewalsResult.error);
          return;
        }

        if (prevRenewalsResult.error) {
          console.error('❌ [RENEWAL METRICS] Error fetching previous renewals:', prevRenewalsResult.error);
        }

        const renewals = renewalsResult.data || [];
        const prevRenewals = prevRenewalsResult.data || [];

        console.log('📊 [RENEWAL METRICS] Raw renewals data:', renewals);
        console.log('📊 [RENEWAL METRICS] Renewals fetched:', renewals.length);

        if (renewals.length > 0) {
          // Log the subscription statuses we have
          const statuses = [...new Set(renewals.map(r => r.subscription_status))];
          console.log('📊 [RENEWAL METRICS] Available subscription statuses:', statuses);
        }

        const totalRenewals = renewals.length;
        const totalRenewalRevenue = renewals.reduce((sum, renewal) => sum + (Number(renewal.amount) || 0), 0);
        const averageRenewalValue = totalRenewals > 0 ? totalRenewalRevenue / totalRenewals : 0;

        // Group by plan
        const renewalsByPlan: Record<string, number> = {};
        const renewalRevenueByPlan: Record<string, number> = {};

        renewals.forEach(renewal => {
          const plan = renewal.plan || 'Unknown';
          renewalsByPlan[plan] = (renewalsByPlan[plan] || 0) + 1;
          renewalRevenueByPlan[plan] = (renewalRevenueByPlan[plan] || 0) + (Number(renewal.amount) || 0);
        });

        // Calculate growth rates
        const prevTotalRenewals = prevRenewals.length;
        const prevTotalRenewalRevenue = prevRenewals.reduce((sum, renewal) => sum + (Number(renewal.amount) || 0), 0);

        const renewalGrowth = prevTotalRenewals > 0 
          ? ((totalRenewals - prevTotalRenewals) / prevTotalRenewals) * 100 
          : 0;

        const revenueGrowth = prevTotalRenewalRevenue > 0 
          ? ((totalRenewalRevenue - prevTotalRenewalRevenue) / prevTotalRenewalRevenue) * 100 
          : 0;

        console.log('📊 [RENEWAL METRICS] Plan breakdown:', renewalsByPlan);
        console.log('📊 [RENEWAL METRICS] Revenue breakdown:', renewalRevenueByPlan);

        setMetrics({
          totalRenewals,
          totalRenewalRevenue,
          averageRenewalValue,
          renewalsByPlan,
          renewalRevenueByPlan,
          renewalGrowth,
          revenueGrowth
        });

        console.log('✅ [RENEWAL METRICS] Metrics calculated:', {
          totalRenewals,
          totalRenewalRevenue: totalRenewalRevenue.toFixed(2),
          averageRenewalValue: averageRenewalValue.toFixed(2),
          planBreakdown: Object.keys(renewalsByPlan).length,
          renewalGrowth: renewalGrowth.toFixed(1),
          revenueGrowth: revenueGrowth.toFixed(1)
        });

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
