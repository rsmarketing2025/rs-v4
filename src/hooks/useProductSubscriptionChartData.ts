
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface ChartFilters {
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

interface ProductSubscriptionDataItem {
  date: string;
  amount: number;
  plan: string;
}

export const useProductSubscriptionChartData = (
  dateRange: DateRange,
  filters: ChartFilters
) => {
  const [chartData, setChartData] = useState<ProductSubscriptionDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductSubscriptionData = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching product subscription data...');

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        let query = supabase
          .from('product_sales')
          .select('*')
          .eq('is_subscription', true)
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        const { data: productSales, error } = await query;

        if (error) {
          console.error('❌ Error fetching product subscription data:', error);
          return;
        }

        if (productSales) {
          const chartData: ProductSubscriptionDataItem[] = productSales.map(sale => ({
            date: sale.created_at,
            amount: sale.sale_value || 0,
            plan: sale.product_name || 'Unknown'
          }));

          setChartData(chartData);
          
          console.log('✅ Product subscription chart data loaded:', {
            count: chartData.length,
            filterApplied: 'NO - Products filter removed',
            note: 'Showing all subscription products'
          });
        }

      } catch (error) {
        console.error('❌ Error fetching product subscription chart data:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductSubscriptionData();
  }, [dateRange]); // Removed filters from dependency array since we don't use them anymore

  return { chartData, loading };
};
