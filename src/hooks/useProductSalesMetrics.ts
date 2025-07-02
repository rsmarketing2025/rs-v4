
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
}

interface ProductSalesFilters {
  product: string;
  eventType: string;
  paymentMethod: string;
  status: string;
}

interface ProductSalesMetrics {
  totalProducts: number;
  totalRevenue: number;
  avgTicket: number;
  totalOrders: number;
  productsGrowth: number;
  revenueGrowth: number;
  avgTicketGrowth: number;
  ordersGrowth: number;
}

export const useProductSalesMetrics = (
  dateRange: DateRange,
  filters: ProductSalesFilters
) => {
  const [metrics, setMetrics] = useState<ProductSalesMetrics>({
    totalProducts: 0,
    totalRevenue: 0,
    avgTicket: 0,
    totalOrders: 0,
    productsGrowth: 0,
    revenueGrowth: 0,
    avgTicketGrowth: 0,
    ordersGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching product sales metrics...');

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        let query = supabase
          .from('product_sales')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        if (filters.product !== 'all') {
          query = query.eq('product_name', filters.product);
        }

        const { data: productSales, error } = await query;

        if (error) {
          console.error('❌ Error fetching product sales:', error);
          return;
        }

        if (productSales) {
          const totalProducts = new Set(productSales.map(sale => sale.product_name)).size;
          const totalRevenue = productSales.reduce((sum, sale) => sum + (sale.sale_value || 0), 0);
          const totalOrders = productSales.length;
          const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

          // For growth calculations, we'll use dummy values for now
          // In a real implementation, you'd fetch previous period data
          const productsGrowth = 12.5;
          const revenueGrowth = 15.3;
          const avgTicketGrowth = 8.7;
          const ordersGrowth = 18.2;

          setMetrics({
            totalProducts,
            totalRevenue,
            avgTicket,
            totalOrders,
            productsGrowth,
            revenueGrowth,
            avgTicketGrowth,
            ordersGrowth,
          });
        }

        console.log('✅ Product sales metrics loaded');

      } catch (error) {
        console.error('❌ Error fetching product sales metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange, filters]);

  return { metrics, loading };
};
