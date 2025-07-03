
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAvailableProducts = () => {
  const [products, setProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching available products from subscription_status...');

        const { data, error } = await supabase
          .from('subscription_status')
          .select('plan')
          .not('plan', 'is', null)
          .not('plan', 'eq', '');

        if (error) {
          console.error('❌ Error fetching products:', error);
          return;
        }

        // Extract unique plans and sort them
        const uniqueProducts = [...new Set(data?.map(item => item.plan) || [])].sort();
        
        console.log('✅ Available products loaded:', uniqueProducts);
        setProducts(uniqueProducts);

      } catch (error) {
        console.error('❌ Unexpected error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading };
};
