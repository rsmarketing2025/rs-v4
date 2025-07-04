
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, eachDayOfInterval, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth, isSameDay, startOfYear, endOfYear, startOfWeek, endOfWeek } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

interface NewSubscriptionLineData {
  date: string;
  [productName: string]: string | number; // Dynamic product names as keys
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
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);

  // Determine the chart period based on date range (removing single-day and hourly)
  const getChartPeriod = () => {
    if (!dateRange.from || !dateRange.to) return 'daily';
    
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 6 && daysDiff <= 7) {
      return 'weekly';
    } else if (daysDiff > 300) {
      return 'yearly';
    } else {
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

        // Simplificar a lógica de timezone - usar as datas como estão no dateRange
        // e converter apenas para formatação da query
        const startDateStr = format(startOfDay(dateRange.from), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endOfDay(dateRange.to), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        console.log('📊 Date range for new subscriptions:', { 
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
          setTotalSubscriptions(0);
          return;
        }

        console.log('📊 Raw new subscriptions data:', newSubscriptions?.length || 0, 'records');
        console.log('📊 Sample new subscription records:', newSubscriptions?.slice(0, 3));

        // Calculate total unique subscriptions for the period
        const uniqueSubscriptions = new Set();
        newSubscriptions?.forEach(subscription => {
          if (subscription.subscription_id) {
            uniqueSubscriptions.add(subscription.subscription_id);
          }
        });
        const totalUniqueSubscriptions = uniqueSubscriptions.size;
        setTotalSubscriptions(totalUniqueSubscriptions);

        console.log('📊 Total unique subscriptions:', totalUniqueSubscriptions);

        const chartPeriod = getChartPeriod();
        console.log('📊 Chart period:', chartPeriod);

        // Prepare data based on chart period
        const prepareChartData = () => {
          if (!newSubscriptions || newSubscriptions.length === 0) {
            console.log('📊 No new subscriptions data found for the period');
            // Create empty data structure based on period
            if (chartPeriod === 'weekly') {
              const weekStart = startOfWeek(dateRange.from, { weekStartsOn: 1 });
              const weekEnd = endOfWeek(dateRange.to, { weekStartsOn: 1 });
              const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
              return days.map(day => ({
                date: format(day, 'EEE dd/MM', { locale: ptBR })
              }));
            } else if (chartPeriod === 'yearly') {
              const yearStart = startOfYear(dateRange.from);
              const yearEnd = endOfYear(dateRange.to);
              const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
              return months.map(month => ({
                date: format(month, 'MMM', { locale: ptBR })
              }));
            } else {
              const allDays = eachDayOfInterval({ 
                start: startOfDay(dateRange.from), 
                end: endOfDay(dateRange.to) 
              });
              return allDays.map(day => ({
                date: format(day, 'dd/MM')
              }));
            }
          }

          // Get all unique plans from the data
          const uniquePlans = [...new Set(newSubscriptions.map(sub => sub.plan))].sort();
          console.log('📊 Unique plans found:', uniquePlans);

          if (chartPeriod === 'weekly') {
            const weekStart = startOfWeek(dateRange.from, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(dateRange.to, { weekStartsOn: 1 });
            const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
            
            console.log('📊 Weekly period - using selected week:', {
              weekStart: format(weekStart, 'yyyy-MM-dd'),
              weekEnd: format(weekEnd, 'yyyy-MM-dd'),
              selectedFrom: format(dateRange.from, 'yyyy-MM-dd'),
              selectedTo: format(dateRange.to, 'yyyy-MM-dd')
            });
            
            return days.map(day => {
              const dayData: NewSubscriptionLineData = {
                date: format(day, 'EEE dd/MM', { locale: ptBR })
              };

              // Initialize all plans with 0
              uniquePlans.forEach(plan => {
                dayData[plan] = 0;
              });

              // Add revenue for each plan on this day
              newSubscriptions.forEach(subscription => {
                if (!subscription.created_at) return;
                try {
                  const subscriptionDateUTC = parseISO(subscription.created_at);
                  const subscriptionDateBrazil = toZonedTime(subscriptionDateUTC, BRAZIL_TIMEZONE);
                  
                  if (isSameDay(subscriptionDateBrazil, day)) {
                    const currentValue = dayData[subscription.plan] as number;
                    dayData[subscription.plan] = currentValue + (Number(subscription.amount) || 0);
                  }
                } catch {
                  // Skip invalid dates
                }
              });
              
              return dayData;
            });
          }
          
          else if (chartPeriod === 'yearly') {
            const yearStart = startOfYear(dateRange.from);
            const yearEnd = endOfYear(dateRange.to);
            const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
            
            return months.map(month => {
              const monthStart = startOfMonth(month);
              const monthEnd = endOfMonth(month);
              
              const monthData: NewSubscriptionLineData = {
                date: format(month, 'MMM', { locale: ptBR })
              };

              // Initialize all plans with 0
              uniquePlans.forEach(plan => {
                monthData[plan] = 0;
              });

              // Add revenue for each plan in this month
              newSubscriptions.forEach(subscription => {
                if (!subscription.created_at) return;
                try {
                  const subscriptionDateUTC = parseISO(subscription.created_at);
                  const subscriptionDateBrazil = toZonedTime(subscriptionDateUTC, BRAZIL_TIMEZONE);
                  
                  if (subscriptionDateBrazil >= monthStart && subscriptionDateBrazil <= monthEnd) {
                    const currentValue = monthData[subscription.plan] as number;
                    monthData[subscription.plan] = currentValue + (Number(subscription.amount) || 0);
                  }
                } catch {
                  // Skip invalid dates
                }
              });
              
              return monthData;
            });
          }
          
          else {
            // Default daily view
            const allDays = eachDayOfInterval({ 
              start: startOfDay(dateRange.from), 
              end: endOfDay(dateRange.to) 
            });
            
            return allDays.map(day => {
              const dayData: NewSubscriptionLineData = {
                date: format(day, 'dd/MM')
              };

              // Initialize all plans with 0
              uniquePlans.forEach(plan => {
                dayData[plan] = 0;
              });

              // Add revenue for each plan on this day
              newSubscriptions.forEach(subscription => {
                if (!subscription.created_at) return;
                try {
                  // Parse the UTC date from database and convert to Brazil timezone
                  const subscriptionDateUTC = parseISO(subscription.created_at);
                  const subscriptionDateBrazil = toZonedTime(subscriptionDateUTC, BRAZIL_TIMEZONE);
                  
                  if (isSameDay(subscriptionDateBrazil, day)) {
                    const currentValue = dayData[subscription.plan] as number;
                    dayData[subscription.plan] = currentValue + (Number(subscription.amount) || 0);
                    console.log('📊 Adding subscription:', {
                      day: format(day, 'dd/MM'),
                      plan: subscription.plan,
                      amount: subscription.amount,
                      subscriptionDate: format(subscriptionDateBrazil, 'yyyy-MM-dd HH:mm:ss'),
                      newTotal: dayData[subscription.plan]
                    });
                  }
                } catch (error) {
                  console.warn('📊 Error parsing subscription date:', subscription.created_at, error);
                }
              });

              return dayData;
            });
          }
        };

        const chartData = prepareChartData();
        setLineData(chartData);

        console.log('✅ New subscriptions line data processed:', {
          chartPeriod,
          totalDays: chartData.length,
          sampleData: chartData.slice(0, 3),
          totalSubscriptions: newSubscriptions?.length || 0,
          uniqueSubscriptions: totalUniqueSubscriptions
        });

      } catch (error) {
        console.error('❌ Error in fetchLineData:', error);
        setLineData([]);
        setTotalSubscriptions(0);
      } finally {
        setLoading(false);
      }
    };

    // Adicionar um pequeno delay para evitar múltiplas chamadas
    const timeoutId = setTimeout(fetchLineData, 100);
    
    return () => clearTimeout(timeoutId);
  }, [dateRange.from?.getTime(), dateRange.to?.getTime(), filters.plan, filters.status]);

  return { lineData, loading, totalSubscriptions };
};
