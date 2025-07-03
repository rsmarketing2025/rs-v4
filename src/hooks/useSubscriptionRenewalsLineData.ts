
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, parseISO, eachDayOfInterval, eachHourOfInterval, eachMonthOfInterval } from 'date-fns';

interface LineFilters {
  plan: string;
  status: string;
  products?: string[];
}

interface DateRange {
  from: Date;
  to: Date;
}

interface LineDataItem {
  date: string;
  revenue: number;
  count: number;
}

export const useSubscriptionRenewalsLineData = (
  dateRange: DateRange,
  filters: LineFilters
) => {
  const [lineData, setLineData] = useState<LineDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLineData = async () => {
      try {
        setLoading(true);
        console.log('📈 Fetching renewals line data with filters:', filters);

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        let query = supabase
          .from('subscription_renewals')
          .select('created_at, amount, plan, subscription_status')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

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
        if (filters.products && filters.products.length > 0) {
          console.log('🔍 Applying product filter to line chart:', filters.products);
          query = query.in('plan', filters.products);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error fetching renewals line data:', error);
          return;
        }

        if (data) {
          // Determine the period for grouping based on date range
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          let dateIntervals: Date[];
          let formatString: string;
          
          if (daysDiff <= 1) {
            // Hourly for single day
            dateIntervals = eachHourOfInterval({ start: startDate, end: endDate });
            formatString = 'HH:mm';
          } else if (daysDiff > 300) {
            // Monthly for year ranges
            dateIntervals = eachMonthOfInterval({ start: startDate, end: endDate });
            formatString = 'MMM yyyy';
          } else {
            // Daily for other ranges
            dateIntervals = eachDayOfInterval({ start: startDate, end: endDate });
            formatString = 'dd/MM';
          }

          // Group data by time periods
          const groupedData = dateIntervals.map(intervalDate => {
            const dateKey = format(intervalDate, formatString);
            
            const renewalsInPeriod = data.filter(renewal => {
              const renewalDate = parseISO(renewal.created_at);
              
              if (daysDiff <= 1) {
                // Same hour
                return format(renewalDate, 'HH') === format(intervalDate, 'HH') &&
                       format(renewalDate, 'yyyy-MM-dd') === format(intervalDate, 'yyyy-MM-dd');
              } else if (daysDiff > 300) {
                // Same month
                return format(renewalDate, 'yyyy-MM') === format(intervalDate, 'yyyy-MM');
              } else {
                // Same day
                return format(renewalDate, 'yyyy-MM-dd') === format(intervalDate, 'yyyy-MM-dd');
              }
            });

            const revenue = renewalsInPeriod.reduce((sum, renewal) => sum + (renewal.amount || 0), 0);
            const count = renewalsInPeriod.length;

            return {
              date: dateKey,
              revenue,
              count
            };
          });

          setLineData(groupedData);
          
          console.log('✅ Renewals line data processed:', {
            periods: groupedData.length,
            totalRevenue: groupedData.reduce((sum, item) => sum + item.revenue, 0),
            formatUsed: formatString,
            filtersApplied: {
              status: filters.status,
              products: filters.products?.length || 0
            }
          });
        }

      } catch (error) {
        console.error('❌ Error fetching renewals line data:', error);
        setLineData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLineData();
  }, [dateRange, filters]);

  return { lineData, loading };
};
