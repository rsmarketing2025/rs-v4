
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, eachDayOfInterval, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth, isSameDay, startOfYear, endOfYear, startOfWeek, endOfWeek } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

interface NewSubscriptionLineData {
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

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

export const useNewSubscriptionsLineData = (
  dateRange: DateRange,
  filters: Filters
) => {
  const [lineData, setLineData] = useState<NewSubscriptionLineData[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine the chart period based on date range (same logic as SalesChart)
  const getChartPeriod = () => {
    if (!dateRange.from || !dateRange.to) return 'daily';
    
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    // If it's exactly 1 day (today or yesterday)
    if (daysDiff <= 1) {
      return 'single-day';
    }
    // If it's 6 or 7 days, treat as weekly (covers different week selection scenarios)
    else if (daysDiff >= 6 && daysDiff <= 7) {
      return 'weekly';
    }
    // If it's a year range (more than 300 days)
    else if (daysDiff > 300) {
      return 'yearly';
    }
    // Default to daily for other ranges
    else {
      return 'daily';
    }
  };

  useEffect(() => {
    // Verificar se dateRange é válido
    if (!dateRange.from || !dateRange.to) {
      console.log('📊 Date range invalid, skipping fetch');
      setLoading(false);
      return;
    }

    const fetchLineData = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching new subscriptions line data...');

        // Converter para timezone do Brasil
        const startDate = toZonedTime(startOfDay(dateRange.from), BRAZIL_TIMEZONE);
        const endDate = toZonedTime(endOfDay(dateRange.to), BRAZIL_TIMEZONE);
        
        // Converter de volta para UTC para a query
        const startDateUTC = fromZonedTime(startDate, BRAZIL_TIMEZONE);
        const endDateUTC = fromZonedTime(endDate, BRAZIL_TIMEZONE);
        
        const startDateStr = format(startDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        console.log('📊 Date range for new subscriptions (Brazil timezone):', { 
          originalStart: dateRange.from,
          originalEnd: dateRange.to,
          startDateStr, 
          endDateStr 
        });

        let query = supabase
          .from('subscription_status')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr)
          .in('subscription_status', ['active', 'ativo', 'Active', 'Ativo'])
          .order('created_at', { ascending: true });

        // Apply filters only if they are not 'all'
        if (filters.plan && filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        const { data: newSubscriptions, error } = await query;

        if (error) {
          console.error('❌ Error fetching new subscriptions line data:', error);
          setLineData([]);
          return;
        }

        console.log('📊 Raw new subscriptions data:', newSubscriptions?.length || 0, 'records');

        const chartPeriod = getChartPeriod();
        console.log('📊 Chart period:', chartPeriod);

        // Prepare data based on chart period
        const prepareChartData = () => {
          if (!newSubscriptions || newSubscriptions.length === 0) {
            console.log('📊 No new subscriptions data found for the period');
            // Create empty data structure based on period
            if (chartPeriod === 'single-day') {
              return Array.from({ length: 24 }, (_, hour) => ({
                date: hour.toString().padStart(2, '0') + ':00',
                quantity: 0,
                revenue: 0
              }));
            } else if (chartPeriod === 'weekly') {
              // Use the selected date range to determine the week
              const weekStart = startOfWeek(dateRange.from, { weekStartsOn: 1 }); // Monday of selected week
              const weekEnd = endOfWeek(dateRange.to, { weekStartsOn: 1 }); // Sunday of selected week
              const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
              return days.map(day => ({
                date: format(day, 'EEE dd/MM', { locale: ptBR }),
                quantity: 0,
                revenue: 0
              }));
            } else if (chartPeriod === 'yearly') {
              const yearStart = startOfYear(dateRange.from);
              const yearEnd = endOfYear(dateRange.to);
              const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
              return months.map(month => ({
                date: format(month, 'MMM', { locale: ptBR }),
                quantity: 0,
                revenue: 0
              }));
            } else {
              const allDays = eachDayOfInterval({ 
                start: startOfDay(dateRange.from), 
                end: endOfDay(dateRange.to) 
              });
              return allDays.map(day => ({
                date: format(day, 'dd/MM'),
                quantity: 0,
                revenue: 0
              }));
            }
          }

          if (chartPeriod === 'single-day') {
            // For single day, show hourly breakdown
            const hourlyRevenue: Record<string, { quantity: number; revenue: number }> = {};
            
            // Initialize all hours
            for (let hour = 0; hour < 24; hour++) {
              const hourStr = hour.toString().padStart(2, '0') + ':00';
              hourlyRevenue[hourStr] = { quantity: 0, revenue: 0 };
            }
            
            // Process all new subscriptions
            newSubscriptions.forEach(subscription => {
              if (subscription.created_at) {
                try {
                  const subscriptionDateUTC = parseISO(subscription.created_at);
                  const subscriptionDateLocal = toZonedTime(subscriptionDateUTC, BRAZIL_TIMEZONE);
                  
                  const hour = format(subscriptionDateLocal, 'HH:00');
                  if (hourlyRevenue[hour]) {
                    hourlyRevenue[hour].quantity += 1;
                    hourlyRevenue[hour].revenue += Number(subscription.amount) || 0;
                  }
                } catch (error) {
                  console.warn('📊 Error parsing subscription date:', subscription.created_at, error);
                }
              }
            });

            return Object.entries(hourlyRevenue)
              .map(([hour, data]) => ({ 
                date: hour, 
                quantity: data.quantity,
                revenue: data.revenue 
              }))
              .sort((a, b) => a.date.localeCompare(b.date));
          }
          
          else if (chartPeriod === 'weekly') {
            // For weekly, use the selected date range to determine the week
            const weekStart = startOfWeek(dateRange.from, { weekStartsOn: 1 }); // Monday of selected week
            const weekEnd = endOfWeek(dateRange.to, { weekStartsOn: 1 }); // Sunday of selected week
            const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
            
            console.log('📊 Weekly period - using selected week:', {
              weekStart: format(weekStart, 'yyyy-MM-dd'),
              weekEnd: format(weekEnd, 'yyyy-MM-dd'),
              selectedFrom: format(dateRange.from, 'yyyy-MM-dd'),
              selectedTo: format(dateRange.to, 'yyyy-MM-dd')
            });
            
            return days.map(day => {
              const daySubscriptions = newSubscriptions.filter(subscription => {
                if (!subscription.created_at) return false;
                try {
                  const subscriptionDateUTC = parseISO(subscription.created_at);
                  const subscriptionDateLocal = toZonedTime(subscriptionDateUTC, BRAZIL_TIMEZONE);
                  return isSameDay(subscriptionDateLocal, day);
                } catch {
                  return false;
                }
              });
              
              const dayRevenue = daySubscriptions.reduce((sum, subscription) => sum + (Number(subscription.amount) || 0), 0);
              
              return {
                date: format(day, 'EEE dd/MM', { locale: ptBR }),
                quantity: daySubscriptions.length,
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
              
              const monthSubscriptions = newSubscriptions.filter(subscription => {
                if (!subscription.created_at) return false;
                try {
                  const subscriptionDateUTC = parseISO(subscription.created_at);
                  const subscriptionDateLocal = toZonedTime(subscriptionDateUTC, BRAZIL_TIMEZONE);
                  return subscriptionDateLocal >= monthStart && subscriptionDateLocal <= monthEnd;
                } catch {
                  return false;
                }
              });
              
              const monthRevenue = monthSubscriptions.reduce((sum, subscription) => sum + (Number(subscription.amount) || 0), 0);
              
              return {
                date: format(month, 'MMM', { locale: ptBR }),
                quantity: monthSubscriptions.length,
                revenue: monthRevenue
              };
            });
          }
          
          else {
            // Default daily view
            const allDays = eachDayOfInterval({ 
              start: startOfDay(dateRange.from), 
              end: endOfDay(dateRange.to) 
            });
            
            // Group subscriptions by date
            const subscriptionsByDate: Record<string, { quantity: number; revenue: number }> = {};
            
            // Initialize all days with zero values
            allDays.forEach(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              subscriptionsByDate[dateKey] = { quantity: 0, revenue: 0 };
            });

            // Process subscriptions data
            newSubscriptions.forEach(subscription => {
              if (subscription.created_at) {
                try {
                  // Parse the date from database and convert to Brazil timezone
                  const subscriptionDateUTC = parseISO(subscription.created_at);
                  const subscriptionDateLocal = toZonedTime(subscriptionDateUTC, BRAZIL_TIMEZONE);
                  const dateKey = format(subscriptionDateLocal, 'yyyy-MM-dd');
                  
                  if (subscriptionsByDate[dateKey]) {
                    subscriptionsByDate[dateKey].quantity += 1;
                    subscriptionsByDate[dateKey].revenue += Number(subscription.amount) || 0;
                  }
                } catch (error) {
                  console.warn('📊 Error parsing subscription date:', subscription.created_at, error);
                }
              }
            });

            // Convert to array format for chart
            return allDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const displayDate = format(day, 'dd/MM');
              
              return {
                date: displayDate,
                quantity: subscriptionsByDate[dateKey]?.quantity || 0,
                revenue: subscriptionsByDate[dateKey]?.revenue || 0
              };
            });
          }
        };

        const chartData = prepareChartData();
        setLineData(chartData);

        console.log('✅ New subscriptions line data processed:', {
          chartPeriod,
          totalDays: chartData.length,
          totalSubscriptions: chartData.reduce((sum, item) => sum + item.quantity, 0),
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

    // Adicionar um pequeno delay para evitar múltiplas chamadas
    const timeoutId = setTimeout(fetchLineData, 100);
    
    return () => clearTimeout(timeoutId);
  }, [dateRange.from?.getTime(), dateRange.to?.getTime(), filters.plan, filters.status]);

  return { lineData, loading };
};
