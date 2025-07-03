
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

        // First, get all available products to determine if all are selected
        const { data: allProducts, error: productsError } = await supabase
          .from('product_sales')
          .select('product_name')
          .eq('is_subscription', true)
          .not('product_name', 'is', null)
          .not('product_name', 'eq', '');

        if (productsError) {
          console.error('❌ [PRODUCT SUBSCRIPTION CHART] Error fetching all products:', productsError);
        }

        const uniqueProducts = [...new Set((allProducts || []).map(p => p.product_name))];
        console.log('📊 [PRODUCT SUBSCRIPTION CHART] Available products:', uniqueProducts);
        console.log('📊 [PRODUCT SUBSCRIPTION CHART] Selected products:', filters.products);

        // Determine if product filter should be applied
        const shouldApplyProductFilter = filters.products.length > 0 && 
                                       filters.products.length < uniqueProducts.length;

        console.log('📊 [PRODUCT SUBSCRIPTION CHART] Filter logic:', {
          productsSelected: filters.products.length,
          totalProducts: uniqueProducts.length,
          shouldApplyProductFilter,
          allProductsSelected: filters.products.length === uniqueProducts.length
        });

        let query = supabase
          .from('product_sales')
          .select('*')
          .eq('is_subscription', true)
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        // Apply product filter only if not all products are selected
        if (shouldApplyProductFilter) {
          query = query.in('product_name', filters.products);
          console.log('📊 [PRODUCT SUBSCRIPTION CHART] Applying products filter:', filters.products);
        } else {
          console.log('📊 [PRODUCT SUBSCRIPTION CHART] Not applying products filter (all products selected or none)');
        }

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
            filterApplied: shouldApplyProductFilter ? 'YES' : 'NO',
            productsFilter: shouldApplyProductFilter ? filters.products : 'none (all products selected or none selected)'
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
  }, [dateRange, filters]);

  return { chartData, loading };
};
