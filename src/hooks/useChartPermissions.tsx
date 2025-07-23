import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ChartType = 
  | 'kpi_total_investido'
  | 'kpi_receita'
  | 'kpi_ticket_medio'
  | 'kpi_total_pedidos'
  | 'creative_performance_chart'
  | 'creative_sales_chart'
  | 'sales_summary_cards'
  | 'sales_chart'
  | 'country_sales_chart'
  | 'state_sales_chart'
  | 'affiliate_chart'
  | 'subscription_renewals_chart'
  | 'subscription_status_chart'
  | 'new_subscribers_chart';

interface ChartPermission {
  chart_type: ChartType;
  can_access: boolean;
}

export const useChartPermissions = () => {
  const { user } = useAuth();
  const [chartPermissions, setChartPermissions] = useState<Record<ChartType, boolean>>({} as Record<ChartType, boolean>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartPermissions = useCallback(async () => {
    console.log('🔍 Fetching chart permissions for user:', user?.id);
    
    if (!user) {
      console.log('❌ No user found, setting empty chart permissions');
      setChartPermissions({
        kpi_total_investido: false,
        kpi_receita: false,
        kpi_ticket_medio: false,
        kpi_total_pedidos: false,
        creative_performance_chart: false,
        creative_sales_chart: false,
        sales_summary_cards: false,
        sales_chart: false,
        country_sales_chart: false,
        state_sales_chart: false,
        affiliate_chart: false,
        subscription_renewals_chart: false,
        subscription_status_chart: false,
        new_subscribers_chart: false
      });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('📊 Querying chart permissions for user:', user.id);
      
      const { data: permissions, error: permError } = await supabase
        .from('user_chart_permissions')
        .select('chart_type, can_access')
        .eq('user_id', user.id);

      if (permError) {
        console.error('❌ Error fetching chart permissions:', permError);
        throw permError;
      }

      console.log('✅ Chart permissions fetched:', permissions);
      
      // Convert array to object for easier lookup
      const permissionsMap = permissions?.reduce((acc, perm) => {
        acc[perm.chart_type as ChartType] = perm.can_access;
        return acc;
      }, {
        kpi_total_investido: false,
        kpi_receita: false,
        kpi_ticket_medio: false,
        kpi_total_pedidos: false,
        creative_performance_chart: false,
        creative_sales_chart: false,
        sales_summary_cards: false,
        sales_chart: false,
        country_sales_chart: false,
        state_sales_chart: false,
        affiliate_chart: false,
        subscription_renewals_chart: false,
        subscription_status_chart: false,
        new_subscribers_chart: false
      } as Record<ChartType, boolean>) || {
        kpi_total_investido: false,
        kpi_receita: false,
        kpi_ticket_medio: false,
        kpi_total_pedidos: false,
        creative_performance_chart: false,
        creative_sales_chart: false,
        sales_summary_cards: false,
        sales_chart: false,
        country_sales_chart: false,
        state_sales_chart: false,
        affiliate_chart: false,
        subscription_renewals_chart: false,
        subscription_status_chart: false,
        new_subscribers_chart: false
      };
      
      setChartPermissions(permissionsMap);
    } catch (error) {
      console.error('❌ Error in fetchChartPermissions:', error);
      setError('Erro ao carregar permissões de gráficos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('🔄 useChartPermissions effect triggered, user changed:', user?.id);
    fetchChartPermissions();
  }, [fetchChartPermissions]);

  const hasChartPermission = useCallback((chartType: ChartType): boolean => {
    console.log('🔐 Checking chart permission for:', chartType);
    console.log('📋 Current chart permissions:', chartPermissions);
    
    const hasAccess = chartPermissions[chartType] || false;
    
    console.log(`✅ Chart permission result for ${chartType}:`, hasAccess);
    
    return hasAccess;
  }, [chartPermissions]);

  const refreshChartPermissions = useCallback(() => {
    console.log('🔄 Refreshing chart permissions manually');
    setLoading(true);
    fetchChartPermissions();
  }, [fetchChartPermissions]);

  // Auto-refresh permissions every 30 seconds to catch updates from other sources
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing chart permissions');
      fetchChartPermissions();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchChartPermissions]);

  return {
    chartPermissions,
    loading,
    error,
    hasChartPermission,
    refreshChartPermissions
  };
};