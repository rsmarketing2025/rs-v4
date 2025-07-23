import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PagePermission {
  page: string;
  can_access: boolean;
}

interface Permissions {
  pages: PagePermission[];
}

export const usePermissions = () => {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<Permissions>({
    pages: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    console.log('🔍 Fetching permissions for user:', user?.id);
    
    if (!user) {
      console.log('❌ No user found, setting empty permissions');
      setPermissions({ pages: [] });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('📊 Querying permissions for user:', user.id);
      
      // Fetch page permissions
      const { data: pagePermissions, error: pagePermError } = await supabase
        .from('user_page_permissions')
        .select('page, can_access')
        .eq('user_id', user.id);

      if (pagePermError) {
        console.error('❌ Error fetching page permissions:', pagePermError);
        throw pagePermError;
      }

      console.log('✅ Page permissions fetched:', pagePermissions);
      
      setPermissions({
        pages: pagePermissions || []
      });
    } catch (error) {
      console.error('❌ Error in fetchPermissions:', error);
      setError('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('🔄 usePermissions effect triggered, user changed:', user?.id);
    fetchPermissions();
  }, [fetchPermissions]);

  const canAccessPage = useCallback((page: string): boolean => {
    console.log('🔐 Checking page access for:', page);
    console.log('📋 Current page permissions:', permissions.pages);
    
    const permission = permissions.pages.find(p => p.page === page);
    const hasAccess = permission ? permission.can_access : false;
    
    console.log(`🎯 Page permission for ${page}:`, permission);
    console.log(`✅ Page access result for ${page}:`, hasAccess);
    
    return hasAccess;
  }, [permissions.pages]);

  // Chart permissions now use page-level permissions
  const canAccessChart = useCallback((chartId: string): boolean => {
    // All chart access is now controlled by page permissions
    return canAccessPage('charts');
  }, [canAccessPage]);

  const canManageUsers = useCallback((): boolean => {
    return canAccessPage('users');
  }, [canAccessPage]);

  const canManageBusinessManagers = useCallback((): boolean => {
    return canAccessPage('business-managers');
  }, [canAccessPage]);

  // Page-level permission functions
  const canViewKPIs = useCallback((): boolean => {
    return canAccessPage('kpis');
  }, [canAccessPage]);

  const canViewCharts = useCallback((): boolean => {
    return canAccessPage('charts');
  }, [canAccessPage]);

  const canViewTables = useCallback((): boolean => {
    return canAccessPage('tables');
  }, [canAccessPage]);

  const canExportData = useCallback((): boolean => {
    return canAccessPage('exports');
  }, [canAccessPage]);

  // Chart-specific permission functions
  const canViewKPITotalInvestido = useCallback((): boolean => {
    return canAccessChart('kpi-total-investido');
  }, [canAccessChart]);

  const canViewKPIReceita = useCallback((): boolean => {
    return canAccessChart('kpi-receita');
  }, [canAccessChart]);

  const canViewKPITicketMedio = useCallback((): boolean => {
    return canAccessChart('kpi-ticket-medio');
  }, [canAccessChart]);

  const canViewKPITotalPedidos = useCallback((): boolean => {
    return canAccessChart('kpi-total-pedidos');
  }, [canAccessChart]);

  const canViewPerformanceChart = useCallback((): boolean => {
    return canAccessChart('grafico-performance-criativa');
  }, [canAccessChart]);

  const canViewSalesChart = useCallback((): boolean => {
    return canAccessChart('grafico-vendas-criativas');
  }, [canAccessChart]);

  const canViewSalesCards = useCallback((): boolean => {
    return canAccessChart('cards-resumo-vendas');
  }, [canAccessChart]);

  const refreshPermissions = useCallback(() => {
    console.log('🔄 Refreshing permissions manually');
    setLoading(true);
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    canAccessPage,
    canAccessChart,
    canManageUsers,
    canManageBusinessManagers,
    canViewKPIs,
    canViewCharts,
    canViewTables,
    canExportData,
    canViewKPITotalInvestido,
    canViewKPIReceita,
    canViewKPITicketMedio,
    canViewKPITotalPedidos,
    canViewPerformanceChart,
    canViewSalesChart,
    canViewSalesCards,
    refreshPermissions,
    isAdmin
  };
};