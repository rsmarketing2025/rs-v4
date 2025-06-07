
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PagePermission {
  page: string;
  can_access: boolean;
}

interface ChartPermission {
  chart_type: string;
  page: string;
  can_view: boolean;
}

interface Permissions {
  pages: PagePermission[];
  charts: ChartPermission[];
}

export const usePermissions = () => {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<Permissions>({
    pages: [],
    charts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Buscar permissões de páginas
        const { data: pagePermissions } = await supabase
          .from('user_page_permissions')
          .select('page, can_access')
          .eq('user_id', user.id);

        // Buscar permissões de gráficos
        const { data: chartPermissions } = await supabase
          .from('user_chart_permissions')
          .select('chart_type, page, can_view')
          .eq('user_id', user.id);

        setPermissions({
          pages: pagePermissions || [],
          charts: chartPermissions || []
        });
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  const canAccessPage = (page: string): boolean => {
    // Admins têm acesso total
    if (isAdmin) return true;
    
    const permission = permissions.pages.find(p => p.page === page);
    return permission ? permission.can_access : false;
  };

  const canViewChart = (chartType: string, page: string): boolean => {
    // Admins têm acesso total
    if (isAdmin) return true;
    
    const permission = permissions.charts.find(
      c => c.chart_type === chartType && c.page === page
    );
    return permission ? permission.can_view : true; // Default para true se não encontrar
  };

  return {
    permissions,
    loading,
    canAccessPage,
    canViewChart
  };
};
