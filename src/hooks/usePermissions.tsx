
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

type UserPage = Database['public']['Enums']['user_page'];
type ChartType = Database['public']['Enums']['chart_type'];

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
  const { user } = useAuth();
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
    if (user?.id) {
      fetchPermissions();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchPermissions = async () => {
    if (!user?.id) return;

    try {
      // Fetch page permissions
      const { data: pagePermsData, error: pagePermsError } = await supabase
        .from('user_page_permissions')
        .select('page, can_access')
        .eq('user_id', user.id);

      if (pagePermsError) throw pagePermsError;

      if (pagePermsData) {
        const permissions = {
          creatives: pagePermsData.find(p => p.page === 'creatives')?.can_access ?? true,
          sales: pagePermsData.find(p => p.page === 'sales')?.can_access ?? true,
          affiliates: pagePermsData.find(p => p.page === 'affiliates')?.can_access ?? true,
          revenue: pagePermsData.find(p => p.page === 'revenue')?.can_access ?? true,
          users: pagePermsData.find(p => p.page === 'users')?.can_access ?? false,
        };
        setPagePermissions(permissions);
      }

      // Fetch chart permissions
      const { data: chartPermsData, error: chartPermsError } = await supabase
        .from('user_chart_permissions')
        .select('chart_type, page, can_view')
        .eq('user_id', user.id);

      if (chartPermsError) throw chartPermsError;

      if (chartPermsData) {
        const chartPerms = chartPermsData.map(p => ({
          chartType: p.chart_type,
          page: p.page,
          canView: p.can_view
        }));
        setChartPermissions(chartPerms);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPageAccess = (page: keyof PagePermissions): boolean => {
    return pagePermissions[page];
  };

  const hasChartAccess = (chartType: string, page: string): boolean => {
    const permission = chartPermissions.find(p => p.chartType === chartType && p.page === page);
    return permission ? permission.canView : true; // Default to true if no specific permission
  };

  const getAccessiblePages = (): (keyof PagePermissions)[] => {
    return Object.keys(pagePermissions).filter(page => 
      pagePermissions[page as keyof PagePermissions]
    ) as (keyof PagePermissions)[];
  };

  return {
    pagePermissions,
    chartPermissions,
    loading,
    hasPageAccess,
    hasChartAccess,
    getAccessiblePages,
    refetchPermissions: fetchPermissions
  };
};
