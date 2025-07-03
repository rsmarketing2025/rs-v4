
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, eachDayOfInterval, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth, isSameDay, startOfYear, endOfYear, startOfWeek, endOfWeek } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

interface SalesChartData {
  date: string;
  revenue: number;
  quantity: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface Filters {
  creative: string;
  paymentMethod: string;
  status: string;
}

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

export const useSalesChartData = (
  dateRange: DateRange,
  filters: Filters
) => {
  const [chartData, setChartData] = useState<SalesChartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine the chart period based on date range
  const getChartPeriod = () => {
    if (!dateRange.from || !dateRange.to) return 'daily';
    
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      return 'single-day';
    } else if (daysDiff >= 6 && daysDiff <= 7) {
      return 'weekly';
    } else if (daysDiff > 300) {
      return 'yearly';
    } else {
      return 'daily';
    }
  };

  useEffect(() => {
    if (!dateRange.from || !dateRange.to) {
      console.log('📊 Date range invalid, skipping fetch');
      setLoading(false);
      return;
    }

    const fetchSalesData = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching sales chart data...');

        // Convert to Brazil timezone
        const startDate = toZonedTime(startOfDay(dateRange.from), BRAZIL_TIMEZONE);
        const endDate = toZonedTime(endOfDay(dateRange.to), BRAZIL_TIMEZONE);
        
        // Convert back to UTC for query
        const startDateUTC = fromZonedTime(startDate, BRAZIL_TIMEZONE);
        const endDateUTC = fromZonedTime(endDate, BRAZIL_TIMEZONE);
        
        const startDateStr = format(startDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        console.log('📊 Date range for sales (Brazil timezone):', { 
          originalStart: dateRange.from,
          originalEnd: dateRange.to,
          startDateStr, 
          endDateStr 
        });

        let query = supabase
          .from('creative_sales')
          .select('*')
          .gte('sale_date', startDateStr)
          .lte('sale_date', endDateStr)
          .eq('status', 'completed')
          .order('sale_date', { ascending: true });

        // Apply filters only if they are not 'all'
        if (filters.creative && filters.creative !== 'all') {
          query = query.eq('creative_name', filters.creative);
        }

        if (filters.paymentMethod && filters.paymentMethod !== 'all') {
          query = query.eq('payment_method', filters.paymentMethod);
        }

        const { data: sales, error } = await query;

        if (error) {
          console.error('❌ Error fetching sales data:', error);
          setChartData([]);
          return;
        }

        console.log('📊 Raw sales data:', sales?.length || 0, 'records');

        const chartPeriod = getChartPeriod();
        console.log('📊 Chart period:', chartPeriod);

        // Prepare data based on chart period
        const prepareChartData = () => {
          if (!sales || sales.length === 0) {
            console.log('📊 No sales data found for the period');
            // Create empty data structure based on period
            if (chartPeriod === 'single-day') {
              return Array.from({ length: 24 }, (_, hour) => ({
                date: hour.toString().padStart(2, '0') + ':00',
                revenue: 0,
                quantity: 0
              }));
            } else if (chartPeriod === 'weekly') {
              const weekStart = startOfWeek(dateRange.from, { weekStartsOn: 1 });
              const weekEnd = endOfWeek(dateRange.to, { weekStartsOn: 1 });
              const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
              return days.map(day => ({
                date: format(day, 'EEE dd/MM', { locale: ptBR }),
                revenue: 0,
                quantity: 0
              }));
            } else if (chartPeriod === 'yearly') {
              const yearStart = startOfYear(dateRange.from);
              const yearEnd = endOfYear(dateRange.to);
              const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
              return months.map(month => ({
                date: format(month, 'MMM', { locale: ptBR }),
                revenue: 0,
                quantity: 0
              }));
            } else {
              const allDays = eachDayOfInterval({ 
                start: startOfDay(dateRange.from), 
                end: endOfDay(dateRange.to) 
              });
              return allDays.map(day => ({
                date: format(day, 'dd/MM'),
                revenue: 0,
                quantity: 0
              }));
            }
          }

          if (chartPeriod === 'single-day') {
            // For single day, show hourly breakdown
            const hourlyRevenue: Record<string, { revenue: number; quantity: number }> = {};
            
            // Initialize all hours
            for (let hour = 0; hour < 24; hour++) {
              const hourStr = hour.toString().padStart(2, '0') + ':00';
              hourlyRevenue[hourStr] = { revenue: 0, quantity: 0 };
            }
            
            // Filter sales for the specific selected day and aggregate by hour
            const targetDate = dateRange.from;
            const dayStart = startOfDay(targetDate);
            const dayEnd = endOfDay(targetDate);
            
            sales.forEach(sale => {
              if (sale.sale_date) {
                try {
                  const saleDateUTC = parseISO(sale.sale_date);
                  const saleDateLocal = toZonedTime(saleDateUTC, BRAZIL_TIMEZONE);
                  
                  // Only include sales from the specific selected day
                  if (saleDateLocal >= dayStart && saleDateLocal <= dayEnd) {
                    const hour = format(saleDateLocal, 'HH:00');
                    if (hourlyRevenue[hour]) {
                      hourlyRevenue[hour].revenue += Number(sale.gross_value) || 0;
                      hourlyRevenue[hour].quantity += 1;
                    }
                  }
                } catch (error) {
                  console.warn('📊 Error parsing sale date:', sale.sale_date, error);
                }
              }
            });

            return Object.entries(hourlyRevenue)
              .map(([hour, data]) => ({ 
                date: hour, 
                revenue: data.revenue,
                quantity: data.quantity
              }))
              .sort((a, b) => a.date.localeCompare(b.date));
          }
          
          else if (chartPeriod === 'weekly') {
            // For weekly, use the selected date range to determine the week
            const weekStart = startOfWeek(dateRange.from, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(dateRange.to, { weekStartsOn: 1 });
            const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
            
            return days.map(day => {
              const daySales = sales.filter(sale => {
                if (!sale.sale_date) return false;
                try {
                  const saleDateUTC = parseISO(sale.sale_date);
                  const saleDateLocal = toZonedTime(saleDateUTC, BRAZIL_TIMEZONE);
                  return isSameDay(saleDateLocal, day);
                } catch {
                  return false;
                }
              });
              
              const dayRevenue = daySales.reduce((sum, sale) => sum + (Number(sale.gross_value) || 0), 0);
              
              return {
                date: format(day, 'EEE dd/MM', { locale: ptBR }),
                revenue: dayRevenue,
                quantity: daySales.length
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
              
              const monthSales = sales.filter(sale => {
                if (!sale.sale_date) return false;
                try {
                  const saleDateUTC = parseISO(sale.sale_date);
                  const saleDateLocal = toZonedTime(saleDateUTC, BRAZIL_TIMEZONE);
                  return saleDateLocal >= monthStart && saleDateLocal <= monthEnd;
                } catch {
                  return false;
                }
              });
              
              const monthRevenue = monthSales.reduce((sum, sale) => sum + (Number(sale.gross_value) || 0), 0);
              
              return {
                date: format(month, 'MMM', { locale: ptBR }),
                revenue: monthRevenue,
                quantity: monthSales.length
              };
            });
          }
          
          else {
            // Default daily view
            const allDays = eachDayOfInterval({ 
              start: startOfDay(dateRange.from), 
              end: endOfDay(dateRange.to) 
            });
            
            // Group sales by date
            const salesByDate: Record<string, { revenue: number; quantity: number }> = {};
            
            // Initialize all days with zero values
            allDays.forEach(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              salesByDate[dateKey] = { revenue: 0, quantity: 0 };
            });

            // Process sales data
            sales.forEach(sale => {
              if (sale.sale_date) {
                try {
                  // Parse the date from database and convert to Brazil timezone
                  const saleDateUTC = parseISO(sale.sale_date);
                  const saleDateLocal = toZonedTime(saleDateUTC, BRAZIL_TIMEZONE);
                  const dateKey = format(saleDateLocal, 'yyyy-MM-dd');
                  
                  if (salesByDate[dateKey]) {
                    salesByDate[dateKey].revenue += Number(sale.gross_value) || 0;
                    salesByDate[dateKey].quantity += 1;
                  }
                } catch (error) {
                  console.warn('📊 Error parsing sale date:', sale.sale_date, error);
                }
              }
            });

            // Convert to array format for chart
            return allDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const displayDate = format(day, 'dd/MM');
              
              return {
                date: displayDate,
                revenue: salesByDate[dateKey]?.revenue || 0,
                quantity: salesByDate[dateKey]?.quantity || 0
              };
            });
          }
        };

        const chartData = prepareChartData();
        setChartData(chartData);

        console.log('✅ Sales chart data processed:', {
          chartPeriod,
          totalDays: chartData.length,
          totalSales: chartData.reduce((sum, item) => sum + item.quantity, 0),
          totalRevenue: chartData.reduce((sum, item) => sum + item.revenue, 0),
          sampleData: chartData.slice(0, 3)
        });

      } catch (error) {
        console.error('❌ Error in fetchSalesData:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent multiple calls
    const timeoutId = setTimeout(fetchSalesData, 100);
    
    return () => clearTimeout(timeoutId);
  }, [dateRange.from?.getTime(), dateRange.to?.getTime(), filters.creative, filters.paymentMethod, filters.status]);

  return { chartData, loading };
};
