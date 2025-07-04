
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, eachDayOfInterval, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth, isSameDay, startOfYear, endOfYear, startOfWeek, endOfWeek } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
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

  // Determine the chart period based on date range
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

        // TIMEZONE FIX: Convert user's date range (Brazil timezone) to UTC for database query
        // The user selects dates in their local timezone (Brazil), but we need to query in UTC
        const startOfDayBrazil = startOfDay(dateRange.from);
        const endOfDayBrazil = endOfDay(dateRange.to);
        
        // Convert Brazil timezone dates to UTC for database filtering
        const startDateUTC = fromZonedTime(startOfDayBrazil, BRAZIL_TIMEZONE);
        const endDateUTC = fromZonedTime(endOfDayBrazil, BRAZIL_TIMEZONE);
        
        const startDateStr = format(startDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        console.log('📊 TIMEZONE CORRECTION - Date range for new subscriptions:', { 
          originalStart: dateRange.from,
          originalEnd: dateRange.to,
          startOfDayBrazil,
          endOfDayBrazil,
          startDateUTC,
          endDateUTC,
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
        console.log('📊 All new subscription records:', newSubscriptions);

        // Count total new subscriptions (all records in the period)
        const totalUniqueSubscriptions = newSubscriptions?.length || 0;
        setTotalSubscriptions(totalUniqueSubscriptions);

        console.log('📊 Total new subscriptions:', totalUniqueSubscriptions);

        // Calculate total revenue DIRECTLY from the raw data
        let directTotalRevenue = 0;
        const revenueByPlan: { [key: string]: number } = {};
        
        if (newSubscriptions && newSubscriptions.length > 0) {
          console.log('📊 DIRECT REVENUE CALCULATION:');
          newSubscriptions.forEach((sub, index) => {
            const amount = Number(sub.amount) || 0;
            directTotalRevenue += amount;
            
            // Track revenue by plan
            if (!revenueByPlan[sub.plan]) {
              revenueByPlan[sub.plan] = 0;
            }
            revenueByPlan[sub.plan] += amount;
            
            console.log(`📊 Direct calc ${index + 1}: Plan=${sub.plan}, Amount=${amount}, Running Total=${directTotalRevenue}`);
          });
          
          console.log('📊 FINAL DIRECT REVENUE TOTAL:', directTotalRevenue);
          console.log('📊 Revenue by plan:', revenueByPlan);
        }

        const chartPeriod = getChartPeriod();
        console.log('📊 Chart period:', chartPeriod);

        // Prepare data based on chart period with TIMEZONE CONSISTENT logic
        const prepareChartData = () => {
          if (!newSubscriptions || newSubscriptions.length === 0) {
            console.log('📊 No new subscriptions data found for the period');
            // Create empty data structure based on period using Brazil timezone
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

          // TIMEZONE CONSISTENT GROUPING LOGIC - Both filter and group use same timezone conversion
          const subscriptionsByDateStr: { [dateStr: string]: typeof newSubscriptions } = {};
          
          console.log('📊 GROUPING SUBSCRIPTIONS BY DATE (TIMEZONE CONSISTENT):');
          newSubscriptions.forEach(subscription => {
            if (!subscription.created_at) return;
            
            try {
              // Parse UTC date from database and convert to Brazil timezone - SAME AS FILTERING
              const subscriptionDateUTC = parseISO(subscription.created_at);
              const subscriptionDateBrazil = toZonedTime(subscriptionDateUTC, BRAZIL_TIMEZONE);
              
              // Create date string based on period using Brazil timezone
              let dateStr: string;
              if (chartPeriod === 'weekly') {
                dateStr = format(subscriptionDateBrazil, 'EEE dd/MM', { locale: ptBR });
              } else if (chartPeriod === 'yearly') {
                dateStr = format(subscriptionDateBrazil, 'MMM', { locale: ptBR });
              } else {
                dateStr = format(subscriptionDateBrazil, 'dd/MM');
              }
              
              // Check if this date falls within our Brazil timezone range
              const subscriptionDayBrazil = startOfDay(subscriptionDateBrazil);
              const startDayBrazil = startOfDay(dateRange.from);
              const endDayBrazil = startOfDay(dateRange.to);
              
              if (subscriptionDayBrazil >= startDayBrazil && subscriptionDayBrazil <= endDayBrazil) {
                if (!subscriptionsByDateStr[dateStr]) {
                  subscriptionsByDateStr[dateStr] = [];
                }
                subscriptionsByDateStr[dateStr].push(subscription);
                
                console.log(`📊 Grouped: ${subscription.plan} (${subscription.amount}) -> ${dateStr} (Brazil: ${format(subscriptionDateBrazil, 'yyyy-MM-dd HH:mm:ss')})`);
              } else {
                console.log(`📊 EXCLUDED: ${subscription.plan} outside Brazil date range. Brazil date: ${format(subscriptionDateBrazil, 'yyyy-MM-dd')}, Range: ${format(startDayBrazil, 'yyyy-MM-dd')} to ${format(endDayBrazil, 'yyyy-MM-dd')}`);
              }
            } catch (error) {
              console.warn('📊 Error parsing subscription date:', subscription.created_at, error);
            }
          });
          
          console.log('📊 GROUPED SUBSCRIPTIONS (TIMEZONE CONSISTENT):', subscriptionsByDateStr);

          // Generate chart data based on period using Brazil timezone dates
          let chartData: NewSubscriptionLineData[] = [];
          
          if (chartPeriod === 'weekly') {
            const weekStart = startOfWeek(dateRange.from, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(dateRange.to, { weekStartsOn: 1 });
            const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
            
            chartData = days.map(day => {
              const dayStr = format(day, 'EEE dd/MM', { locale: ptBR });
              const dayData: NewSubscriptionLineData = { date: dayStr };
              
              // Initialize all plans with 0
              uniquePlans.forEach(plan => {
                dayData[plan] = 0;
              });
              
              // Add revenue for subscriptions on this day
              const daySubscriptions = subscriptionsByDateStr[dayStr] || [];
              daySubscriptions.forEach(sub => {
                const amount = Number(sub.amount) || 0;
                dayData[sub.plan] = (dayData[sub.plan] as number) + amount;
              });
              
              return dayData;
            });
          } else if (chartPeriod === 'yearly') {
            const yearStart = startOfYear(dateRange.from);
            const yearEnd = endOfYear(dateRange.to);
            const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
            
            chartData = months.map(month => {
              const monthStr = format(month, 'MMM', { locale: ptBR });
              const monthData: NewSubscriptionLineData = { date: monthStr };
              
              // Initialize all plans with 0
              uniquePlans.forEach(plan => {
                monthData[plan] = 0;
              });
              
              // Add revenue for subscriptions in this month
              const monthSubscriptions = subscriptionsByDateStr[monthStr] || [];
              monthSubscriptions.forEach(sub => {
                const amount = Number(sub.amount) || 0;
                monthData[sub.plan] = (monthData[sub.plan] as number) + amount;
              });
              
              return monthData;
            });
          } else {
            // Default daily view using Brazil timezone dates
            const allDays = eachDayOfInterval({ 
              start: startOfDay(dateRange.from), 
              end: endOfDay(dateRange.to) 
            });
            
            chartData = allDays.map(day => {
              const dayStr = format(day, 'dd/MM');
              const dayData: NewSubscriptionLineData = { date: dayStr };
              
              // Initialize all plans with 0
              uniquePlans.forEach(plan => {
                dayData[plan] = 0;
              });
              
              // Add revenue for subscriptions on this day
              const daySubscriptions = subscriptionsByDateStr[dayStr] || [];
              daySubscriptions.forEach(sub => {
                const amount = Number(sub.amount) || 0;
                dayData[sub.plan] = (dayData[sub.plan] as number) + amount;
              });
              
              return dayData;
            });
          }
          
          return chartData;
        };

        const chartData = prepareChartData();
        setLineData(chartData);

        // Calculate and verify total revenue from chart data
        const chartTotalRevenue = chartData.reduce((acc, item) => {
          return acc + Object.keys(item).reduce((sum, key) => {
            if (key !== 'date' && typeof item[key] === 'number') {
              return sum + (item[key] as number);
            }
            return sum;
          }, 0);
        }, 0);

        // VALIDATION: Compare direct calculation vs chart calculation
        console.log('📊 TIMEZONE CORRECTED REVENUE VALIDATION:');
        console.log('📊 Direct calculation total:', directTotalRevenue);
        console.log('📊 Chart calculation total:', chartTotalRevenue);
        console.log('📊 Expected total (user reported):', 1577.55);
        console.log('📊 Match between direct and chart:', Math.abs(directTotalRevenue - chartTotalRevenue) < 0.01);
        
        if (Math.abs(directTotalRevenue - chartTotalRevenue) > 0.01) {
          console.error('❌ REVENUE MISMATCH DETECTED!');
          console.error('❌ Direct:', directTotalRevenue);
          console.error('❌ Chart:', chartTotalRevenue);
          console.error('❌ Difference:', Math.abs(directTotalRevenue - chartTotalRevenue));
        } else {
          console.log('✅ Revenue calculations match after timezone correction');
        }

        console.log('✅ New subscriptions line data processed with timezone correction:', {
          chartPeriod,
          totalDays: chartData.length,
          sampleData: chartData.slice(0, 3),
          totalSubscriptions: newSubscriptions?.length || 0,
          uniqueSubscriptions: totalUniqueSubscriptions,
          directRevenue: directTotalRevenue,
          chartRevenue: chartTotalRevenue,
          expectedRevenue: 1577.55,
          revenueMatch: Math.abs(directTotalRevenue - chartTotalRevenue) < 0.01,
          timezoneConsistent: true
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
