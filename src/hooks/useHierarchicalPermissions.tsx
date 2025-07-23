import { useCallback } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useChartPermissions, ChartType } from '@/hooks/useChartPermissions';

// Mapeamento de seções para seus respectivos tipos de gráficos
const SECTION_CHART_MAPPING = {
  kpis: [
    'kpi_total_investido',
    'kpi_receita', 
    'kpi_ticket_medio',
    'kpi_total_pedidos'
  ] as ChartType[],
  creatives: [
    'creative_performance_chart',
    'creative_sales_chart'
  ] as ChartType[],
  sales: [
    'sales_summary_cards',
    'sales_chart',
    'country_sales_chart',
    'state_sales_chart'
  ] as ChartType[],
  subscriptions: [
    'subscription_renewals_chart',
    'subscription_status_chart',
    'new_subscribers_chart'
  ] as ChartType[],
  affiliates: [
    'affiliate_chart'
  ] as ChartType[]
};

export const useHierarchicalPermissions = () => {
  const { canAccessPage, loading: permissionsLoading, ...permissionMethods } = usePermissions();
  const { hasChartPermission, loading: chartLoading, ...chartMethods } = useChartPermissions();

  const loading = permissionsLoading || chartLoading;

  /**
   * Verifica se uma seção deve ser visível com base nas permissões hierárquicas:
   * - Se todas as permissões individuais estão desabilitadas, a seção é ocultada
   * - Se pelo menos uma permissão individual está habilitada, a seção é mostrada
   * - Se não há gráficos mapeados para a seção, usa a permissão de página original
   */
  const canAccessSection = useCallback((section: keyof typeof SECTION_CHART_MAPPING): boolean => {
    const chartTypes = SECTION_CHART_MAPPING[section];
    
    if (!chartTypes || chartTypes.length === 0) {
      // Se não há gráficos mapeados para esta seção, usa a permissão de página original
      return canAccessPage(section);
    }

    // Verifica se pelo menos um gráfico da seção tem permissão habilitada
    const hasAnyChartPermission = chartTypes.some(chartType => hasChartPermission(chartType));
    
    console.log(`🔗 Hierarchical permission check for section "${section}":`, {
      chartTypes,
      hasAnyChartPermission,
      individualPermissions: chartTypes.map(chartType => ({
        chartType,
        permission: hasChartPermission(chartType)
      }))
    });

    return hasAnyChartPermission;
  }, [canAccessPage, hasChartPermission]);

  /**
   * Verifica permissão para páginas que não são seções com gráficos
   */
  const canAccessNonSectionPage = useCallback((page: string): boolean => {
    return canAccessPage(page);
  }, [canAccessPage]);

  /**
   * Verifica permissão individual de gráfico (mantém funcionalidade original)
   */
  const canAccessChart = useCallback((chartType: ChartType): boolean => {
    return hasChartPermission(chartType);
  }, [hasChartPermission]);

  return {
    // Permissões hierárquicas para seções
    canAccessSection,
    
    // Permissões para páginas não-seção
    canAccessNonSectionPage,
    
    // Permissões individuais de gráficos
    canAccessChart,
    
    // Estado de carregamento
    loading,
    
    // Métodos originais dos hooks
    ...permissionMethods,
    ...chartMethods
  };
};