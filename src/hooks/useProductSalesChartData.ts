
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
}

interface ProductSalesDataItem {
  date: string;
  revenue: number;
  product_name: string;
}

export const useProductSalesChartData = (
  dateRange: DateRange,
  subscriptionsOnly: boolean = true
) => {
  const [chartData, setChartData] = useState<ProductSalesDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductSalesData = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching product sales data...');

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        let query = supabase
          .from('product_sales')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        if (subscriptionsOnly) {
          query = query.eq('is_subscription', true);
        }

        const { data: productSales, error } = await query;

        if (error) {
          console.error('❌ Error fetching product sales:', error);
          return;
        }

        if (productSales) {
          const chartData: ProductSalesDataItem[] = productSales.map(sale => ({
            date: sale.created_at,
            revenue: sale.sale_value || 0,
            product_name: sale.product_name || 'Unknown'
          }));

          setChartData(chartData);
        }

        console.log('✅ Product sales data loaded:', productSales?.length || 0);

      } catch (error) {
        console.error('❌ Error fetching product sales data:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductSalesData();
  }, [dateRange, subscriptionsOnly]);

  return { chartData, loading };
};
