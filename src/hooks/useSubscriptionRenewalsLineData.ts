
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { eachDayOfInterval, eachMonthOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  formatDateRangeForQuery, 
  parseDatabaseDate, 
  formatForDisplay, 
  isSameDayBrazil,
  BRAZIL_TIMEZONE 
} from '@/lib/dateUtils';

interface RenewalLineData {
  date: string;
  quantity: number;
  revenue: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface Filters {
  plan: string;
  status: string;
}

export const useSubscriptionRenewalsLineData = (
  dateRange: DateRange,
  filters: Filters
) => {
  const [lineData, setLineData] = useState<RenewalLineData[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine the chart period based on date range
  const getChartPeriod = () => {
    if (!dateRange.from || !dateRange.to) return 'daily';
    
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    // If it's 6 or 7 days, treat as weekly (covers different week selection scenarios)
    if (daysDiff >= 6 && daysDiff <= 7) {
      return 'weekly';
    }
    // If it's a year range (more than 300 days)
    else if (daysDiff > 300) {
      return 'yearly';
    }
    // Default to daily for all other ranges (including single day)
    else {
      return 'daily';
    }
  };

  useEffect(() => {
    // Verify if dateRange is valid
    if (!dateRange.from || !dateRange.to) {
      console.log('📊 Date range invalid, skipping fetch');
      setLoading(false);
      return;
    }

    const fetchLineData = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching subscription renewals line data...');

        // Use standardized date formatting
        const { startDateStr, endDateStr } = formatDateRangeForQuery(dateRange);

        console.log('📊 Date range for renewals (standardized):', { 
          originalStart: dateRange.from,
          originalEnd: dateRange.to,
          startDateStr, 
          endDateStr 
        });

        let query = supabase
          .from('subscription_renewals')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr)
          .order('created_at', { ascending: true });

        // Apply filters only if they are not 'all'
        if (filters.plan && filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        // Fix status filter to use correct Portuguese values
        if (filters.status && filters.status !== 'all') {
          if (filters.status === 'active') {
            // Map 'active' to Portuguese equivalents
            query = query.in('subscription_status', ['ativo', 'active', 'Ativo', 'Active', 'renovação']);
          } else {
            query = query.eq('subscription_status', filters.status);
          }
        }

        const { data: renewals, error } = await query;

        if (error) {
          console.error('❌ Error fetching renewals line data:', error);
          setLineData([]);
          return;
        }

        console.log('📊 Raw renewals data:', renewals?.length || 0, 'records');
        console.log('📊 Sample renewal statuses:', renewals?.slice(0, 5).map(r => r.subscription_status));

        const chartPeriod = getChartPeriod();
        console.log('📊 Chart period:', chartPeriod);

        // Prepare data based on chart period
        const prepareChartData = () => {
          if (!renewals || renewals.length === 0) {
            console.log('📊 No renewals data found for the period');
            // Create empty data structure based on period
            if (chartPeriod === 'weekly') {
              // Use the selected date range to determine the week
              const weekStart = startOfWeek(dateRange.from, { weekStartsOn: 1 }); // Monday of selected week
              const weekEnd = endOfWeek(dateRange.to, { weekStartsOn: 1 }); // Sunday of selected week
              const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
              return days.map(day => ({
                date: formatForDisplay(day, 'weekDay'),
                quantity: 0,
                revenue: 0
              }));
            } else if (chartPeriod === 'yearly') {
              const yearStart = startOfYear(dateRange.from);
              const yearEnd = endOfYear(dateRange.to);
              const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
              return months.map(month => ({
                date: formatForDisplay(month, 'month'),
                quantity: 0,
                revenue: 0
              }));
            } else {
              const allDays = eachDayOfInterval({ 
                start: dateRange.from, 
                end: dateRange.to 
              });
              return allDays.map(day => ({
                date: formatForDisplay(day, 'dayMonth'),
                quantity: 0,
                revenue: 0
              }));
            }
          }

          if (chartPeriod === 'weekly') {
            // For weekly, use the selected date range to determine the week
            const weekStart = startOfWeek(dateRange.from, { weekStartsOn: 1 }); // Monday of selected week
            const weekEnd = endOfWeek(dateRange.to, { weekStartsOn: 1 }); // Sunday of selected week
            const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
            
            console.log('📊 Weekly period - using selected week:', {
              weekStart: formatForDisplay(weekStart, 'date'),
              weekEnd: formatForDisplay(weekEnd, 'date'),
              selectedFrom: formatForDisplay(dateRange.from, 'date'),
              selectedTo: formatForDisplay(dateRange.to, 'date')
            });
            
            return days.map(day => {
              const dayRenewals = renewals.filter(renewal => {
                if (!renewal.created_at) return false;
                try {
                  return isSameDayBrazil(renewal.created_at, day);
                } catch {
                  return false;
                }
              });
              
              const dayRevenue = dayRenewals.reduce((sum, renewal) => sum + (Number(renewal.amount) || 0), 0);
              
              return {
                date: formatForDisplay(day, 'weekDay'),
                quantity: dayRenewals.length,
                revenue: dayRevenue
              };
            });
          }
          
          else if (chartPeriod === 'yearly') {
            // For yearly, show each month
            const yearStart = startOfYear(dateRange.from);
            const yearEnd = endOfYear(dateRange.to);
            const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
            
            return months.map(month => {
              const monthStart = startOfMonth(month);
              const monthEnd = endOfMonth(month);
              
              const monthRenewals = renewals.filter(renewal => {
                if (!renewal.created_at) return false;
                try {
                  const renewalDate = parseDatabaseDate(renewal.created_at);
                  return renewalDate >= monthStart && renewalDate <= monthEnd;
                } catch {
                  return false;
                }
              });
              
              const monthRevenue = monthRenewals.reduce((sum, renewal) => sum + (Number(renewal.amount) || 0), 0);
              
              return {
                date: formatForDisplay(month, 'month'),
                quantity: monthRenewals.length,
                revenue: monthRevenue
              };
            });
          }
          
          else {
            // Default daily view (including single day periods)
            const allDays = eachDayOfInterval({ 
              start: dateRange.from, 
              end: dateRange.to 
            });
            
            // Group renewals by date
            const renewalsByDate: Record<string, { quantity: number; revenue: number }> = {};
            
            // Initialize all days with zero values
            allDays.forEach(day => {
              const dateKey = formatForDisplay(day, 'date');
              renewalsByDate[dateKey] = { quantity: 0, revenue: 0 };
            });

            // Process renewals data
            renewals.forEach(renewal => {
              if (renewal.created_at) {
                try {
                  // Parse the date from database and use standardized handling
                  const renewalDate = parseDatabaseDate(renewal.created_at);
                  const dateKey = formatForDisplay(renewalDate, 'date');
                  
                  if (renewalsByDate[dateKey]) {
                    renewalsByDate[dateKey].quantity += 1;
                    renewalsByDate[dateKey].revenue += Number(renewal.amount) || 0;
                  }
                } catch (error) {
                  console.warn('📊 Error parsing renewal date:', renewal.created_at, error);
                }
              }
            });

            // Convert to array format for chart
            return allDays.map(day => {
              const dateKey = formatForDisplay(day, 'date');
              const displayDate = formatForDisplay(day, 'dayMonth');
              
              return {
                date: displayDate,
                quantity: renewalsByDate[dateKey]?.quantity || 0,
                revenue: renewalsByDate[dateKey]?.revenue || 0
              };
            });
          }
        };

        const chartData = prepareChartData();
        setLineData(chartData);

        console.log('✅ Renewals line data processed:', {
          chartPeriod,
          totalDays: chartData.length,
          totalRenewals: chartData.reduce((sum, item) => sum + item.quantity, 0),
          totalRevenue: chartData.reduce((sum, item) => sum + item.revenue, 0),
          sampleData: chartData.slice(0, 3)
        });

      } catch (error) {
        console.error('❌ Error in fetchLineData:', error);
        setLineData([]);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to avoid multiple calls
    const timeoutId = setTimeout(fetchLineData, 100);
    
    return () => clearTimeout(timeoutId);
  }, [dateRange.from?.getTime(), dateRange.to?.getTime(), filters.plan, filters.status]);

  return { lineData, loading };
};
