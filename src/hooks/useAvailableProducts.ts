
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
        console.log('🔍 Starting to fetch available products from subscription_status...');
      }

      // Add detailed timing logs
      const startTime = performance.now();
      
      const { data, error: queryError, count } = await supabase
        .from('subscription_status')
        .select('plan', { count: 'exact' })
        .not('plan', 'is', null)
        .not('plan', 'eq', '');

      const endTime = performance.now();
      console.log(`⏱️ Query completed in ${(endTime - startTime).toFixed(2)}ms`);

      if (queryError) {
        console.error('❌ Database query error:', {
          message: queryError.message,
          details: queryError.details,
          hint: queryError.hint,
          code: queryError.code
        });
        throw new Error(`Database error: ${queryError.message}`);
      }

      console.log('📊 Raw query results:', {
        totalRecords: count,
        dataLength: data?.length || 0,
        sampleData: data?.slice(0, 3)
      });

      if (!data || data.length === 0) {
        console.warn('⚠️ No data returned from subscription_status table');
        setProducts([]);
        return;
      }

      // Enhanced product extraction with validation
      const allPlans = data.map(item => item.plan).filter(Boolean);
      const uniqueProducts = [...new Set(allPlans)].filter(plan => 
        plan && 
        typeof plan === 'string' && 
        plan.trim().length > 0
      ).sort();

      console.log('🎯 Product extraction details:', {
        totalPlans: allPlans.length,
        uniquePlans: uniqueProducts.length,
        duplicatesRemoved: allPlans.length - uniqueProducts.length,
        products: uniqueProducts
      });

      // Validate uniqueness
      const duplicateCheck = new Map();
      allPlans.forEach(plan => {
        duplicateCheck.set(plan, (duplicateCheck.get(plan) || 0) + 1);
      });

      const duplicates = Array.from(duplicateCheck.entries())
        .filter(([_, count]) => count > 1)
        .map(([plan, count]) => ({ plan, count }));

      if (duplicates.length > 0) {
        console.log('📋 Duplicate plans found:', duplicates);
      }

      setProducts(uniqueProducts);
      setRetryCount(0); // Reset retry count on success
      
      console.log('✅ Products successfully loaded:', {
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
