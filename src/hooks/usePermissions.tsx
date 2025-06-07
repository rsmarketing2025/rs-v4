
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserPermissions {
  pages: {
    creatives: boolean;
    sales: boolean;
    affiliates: boolean;
    revenue: boolean;
    users: boolean;
    businessManagers: boolean;
  };
  charts: {
    [key: string]: boolean;
  };
}

export const usePermissions = () => {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({
    pages: {
      creatives: true,
      sales: true,
      affiliates: true,
      revenue: true,
      users: false,
      businessManagers: false,
    },
    charts: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Admins têm acesso a tudo
      if (isAdmin) {
        setPermissions({
          pages: {
            creatives: true,
            sales: true,
            affiliates: true,
            revenue: true,
            users: true,
            businessManagers: true,
          },
          charts: {},
        });
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

        // Construir objeto de permissões de páginas
        const pages = {
          creatives: pagePermissions?.find(p => p.page === 'creatives')?.can_access ?? true,
          sales: pagePermissions?.find(p => p.page === 'sales')?.can_access ?? true,
          affiliates: pagePermissions?.find(p => p.page === 'affiliates')?.can_access ?? true,
          revenue: pagePermissions?.find(p => p.page === 'revenue')?.can_access ?? true,
          users: pagePermissions?.find(p => p.page === 'users')?.can_access ?? false,
          businessManagers: isAdmin, // Apenas admins podem acessar business managers
        };

        // Construir objeto de permissões de gráficos
        const charts: { [key: string]: boolean } = {};
        chartPermissions?.forEach(permission => {
          const key = `${permission.page}_${permission.chart_type}`;
          charts[key] = permission.can_view;
        });

        setPermissions({ pages, charts });
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user, isAdmin]);

  const hasPageAccess = (page: keyof UserPermissions['pages']) => {
    return permissions.pages[page];
  };

  const hasChartAccess = (page: string, chartType: string) => {
    const key = `${page}_${chartType}`;
    return permissions.charts[key] ?? true; // Default to true se não especificado
  };

  return {
    permissions,
    loading,
    hasPageAccess,
    hasChartAccess,
  };
};
