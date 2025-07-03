
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAvailableProducts = () => {
  const [products, setProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchProducts = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isRetry) {
        console.log(`🔄 Retrying to fetch products (attempt ${retryCount + 1})`);
      } else {
        console.log('🔍 Starting to fetch available products from both tables...');
      }

      const startTime = performance.now();
      
      // Fetch products from subscription_status table
      const { data: statusData, error: statusError } = await supabase
        .from('subscription_status')
        .select('plan')
        .not('plan', 'is', null)
        .not('plan', 'eq', '');

      if (statusError) {
        console.error('❌ Error fetching from subscription_status:', statusError);
        throw new Error(`Database error (subscription_status): ${statusError.message}`);
      }

      // Fetch products from subscription_renewals table
      const { data: renewalsData, error: renewalsError } = await supabase
        .from('subscription_renewals')
        .select('plan')
        .not('plan', 'is', null)
        .not('plan', 'eq', '');

      if (renewalsError) {
        console.error('❌ Error fetching from subscription_renewals:', renewalsError);
        throw new Error(`Database error (subscription_renewals): ${renewalsError.message}`);
      }

      const endTime = performance.now();
      console.log(`⏱️ Both queries completed in ${(endTime - startTime).toFixed(2)}ms`);

      console.log('📊 Raw query results:', {
        statusRecords: statusData?.length || 0,
        renewalsRecords: renewalsData?.length || 0
      });

      // Combine and deduplicate products from both sources
      const statusPlans = (statusData || []).map(item => item.plan).filter(Boolean);
      const renewalsPlans = (renewalsData || []).map(item => item.plan).filter(Boolean);
      
      const allPlans = [...statusPlans, ...renewalsPlans];
      const uniqueProducts = [...new Set(allPlans)].filter(plan => 
        plan && 
        typeof plan === 'string' && 
        plan.trim().length > 0
      ).sort();

      console.log('🎯 Product consolidation details:', {
        statusPlans: statusPlans.length,
        renewalsPlans: renewalsPlans.length,
        totalPlans: allPlans.length,
        uniquePlans: uniqueProducts.length,
        duplicatesRemoved: allPlans.length - uniqueProducts.length,
        products: uniqueProducts
      });

      setProducts(uniqueProducts);
      setRetryCount(0);
      
      console.log('✅ Products successfully loaded from both sources:', {
        count: uniqueProducts.length,
        products: uniqueProducts
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Error fetching products:', {
        error: errorMessage,
        retryCount,
        timestamp: new Date().toISOString()
      });
      
      setError(errorMessage);
      
      // Implement retry logic
      if (retryCount < 3) {
        console.log(`🔄 Scheduling retry ${retryCount + 1}/3 in 2 seconds...`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchProducts(true);
        }, 2000);
      } else {
        console.error('❌ Max retries reached. Setting fallback empty products.');
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  const refetch = useCallback(() => {
    console.log('🔄 Manual refetch triggered');
    setRetryCount(0);
    fetchProducts(false);
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { 
    products, 
    loading, 
    error,
    refetch,
    isRetrying: retryCount > 0
  };
};
