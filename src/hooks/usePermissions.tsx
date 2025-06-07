
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PagePermissions {
  creatives: boolean;
  sales: boolean;
  affiliates: boolean;
  revenue: boolean;
  users: boolean;
}

interface ChartPermission {
  chartType: string;
  page: string;
  canView: boolean;
}

export const usePermissions = () => {
  const { user, isAdmin } = useAuth();
  const [pagePermissions, setPagePermissions] = useState<PagePermissions>({
    creatives: true,
    sales: true,
    affiliates: true,
    revenue: true,
    users: false,
  });
  const [chartPermissions, setChartPermissions] = useState<ChartPermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Se for admin, tem acesso total
        if (isAdmin) {
          setPagePermissions({
            creatives: true,
            sales: true,
            affiliates: true,
            revenue: true,
            users: true,
          });
          
          // Admins têm acesso a todos os gráficos
          const allChartPermissions: ChartPermission[] = [
            { chartType: 'performance_overview', page: 'creatives', canView: true },
            { chartType: 'time_series', page: 'creatives', canView: true },
            { chartType: 'top_creatives', page: 'creatives', canView: true },
            { chartType: 'metrics_comparison', page: 'creatives', canView: true },
            { chartType: 'sales_summary', page: 'sales', canView: true },
            { chartType: 'conversion_funnel', page: 'sales', canView: true },
            { chartType: 'affiliate_performance', page: 'affiliates', canView: true },
            { chartType: 'revenue_breakdown', page: 'revenue', canView: true },
            { chartType: 'roi_analysis', page: 'revenue', canView: true },
          ];
          setChartPermissions(allChartPermissions);
          setLoading(false);
          return;
        }

        // Buscar permissões de página para usuários não-admin
        const { data: pagePermsData, error: pagePermsError } = await supabase
          .from('user_page_permissions')
          .select('page, can_access')
          .eq('user_id', user.id);

        if (pagePermsError) {
          console.error('Erro ao buscar permissões de página:', pagePermsError);
        } else if (pagePermsData) {
          const perms: PagePermissions = {
            creatives: pagePermsData.find(p => p.page === 'creatives')?.can_access ?? true,
            sales: pagePermsData.find(p => p.page === 'sales')?.can_access ?? true,
            affiliates: pagePermsData.find(p => p.page === 'affiliates')?.can_access ?? true,
            revenue: pagePermsData.find(p => p.page === 'revenue')?.can_access ?? true,
            users: pagePermsData.find(p => p.page === 'users')?.can_access ?? false,
          };
          setPagePermissions(perms);
        }

        // Buscar permissões de gráfico
        const { data: chartPermsData, error: chartPermsError } = await supabase
          .from('user_chart_permissions')
          .select('chart_type, page, can_view')
          .eq('user_id', user.id);

        if (chartPermsError) {
          console.error('Erro ao buscar permissões de gráfico:', chartPermsError);
        } else if (chartPermsData) {
          const chartPerms: ChartPermission[] = chartPermsData.map(perm => ({
            chartType: perm.chart_type,
            page: perm.page,
            canView: perm.can_view,
          }));
          setChartPermissions(chartPerms);
        }

      } catch (error) {
        console.error('Erro ao buscar permissões:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user, isAdmin]);

  const hasPageAccess = (page: keyof PagePermissions): boolean => {
    if (isAdmin) return true;
    return pagePermissions[page];
  };

  const hasChartAccess = (chartType: string, page: string): boolean => {
    if (isAdmin) return true;
    const permission = chartPermissions.find(
      p => p.chartType === chartType && p.page === page
    );
    return permission ? permission.canView : true; // Default to true se não encontrar
  };

  return {
    pagePermissions,
    chartPermissions,
    hasPageAccess,
    hasChartAccess,
    loading,
  };
};
