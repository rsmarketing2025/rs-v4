
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionWrapperProps {
  children: React.ReactNode;
  chartType?: string;
  page?: string;
  requirePage?: string;
  fallback?: React.ReactNode;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  chartType,
  page,
  requirePage,
  fallback = null
}) => {
  const { canViewChart, canAccessPage, loading } = usePermissions();

  if (loading) {
    return null;
  }

  // Verificar permissão de página
  if (requirePage && !canAccessPage(requirePage)) {
    return <>{fallback}</>;
  }

  // Verificar permissão de gráfico
  if (chartType && page && !canViewChart(chartType, page)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
</lov-wrapper>

Vou atualizar o CreativesTab para usar o sistema de permissões:

<lov-write file_path="src/components/dashboard/CreativesTab.tsx">
import React, { useState } from 'react';
import { MetricsOverviewCharts } from "./creatives/MetricsOverviewCharts";
import { TimeSeriesChart } from "./creatives/TimeSeriesChart";
import { CreativesFilters } from "./creatives/CreativesFilters";
import { CreativesSummaryCards } from "./creatives/CreativesSummaryCards";
import { CreativesTable } from "./creatives/CreativesTable";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";
import { useCreativesData } from "@/hooks/useCreativesData";

interface CreativesTabProps {
  dateRange: { from: Date; to: Date };
}

export const CreativesTab: React.FC<CreativesTabProps> = ({ dateRange }) => {
  const { creatives, loading } = useCreativesData(dateRange);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showZeroValues, setShowZeroValues] = useState(false);

  const filteredCreatives = creatives.filter(creative => {
    const matchesSearch = creative.creative_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creative.campaign_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || creative.status === statusFilter;
    
    if (!showZeroValues) {
      const hasNonZeroValues = creative.amount_spent > 0 || 
                               creative.sales_count > 0 || 
                               creative.gross_sales > 0 ||
                               creative.views_3s > 0;
      return matchesSearch && matchesStatus && hasNonZeroValues;
    }
    
    return matchesSearch && matchesStatus;
  });

  const totalMetrics = filteredCreatives.reduce((acc, creative) => ({
    spent: acc.spent + creative.amount_spent,
    views: acc.views + creative.views_3s,
    sales: acc.sales + creative.sales_count,
    revenue: acc.revenue + creative.gross_sales,
  }), { spent: 0, views: 0, sales: 0, revenue: 0 });

  const avgROI = totalMetrics.spent > 0 ? totalMetrics.revenue / totalMetrics.spent : 0;

  const exportToCSV = () => {
    const headers = [
      'Criativo', 'Campanha', 'Produtos', 'Tags', 'Período', 'Valor Gasto', 'Views 3s', 'Views 75%', 'Views Total', 'Clicks',
      'PR Hook %', 'Hook Rate %', 'Body Rate %', 'CTA %', 'CTR %', 'Conv. Body %',
      'Qtd Vendas', 'Vendas Bruto', 'Lucro', 'CPA', 'ROI', 'Status'
    ];
    
    const csvData = [
      headers.join(','),
      ...filteredCreatives.map(creative => [
        `"${creative.creative_name}"`,
        `"${creative.campaign_name}"`,
        `"${creative.products ? creative.products.join('; ') : ''}"`,
        `"${creative.tags ? creative.tags.join('; ') : ''}"`,
        `"${creative.start_date} - ${creative.end_date}"`,
        creative.amount_spent.toFixed(2),
        creative.views_3s,
        creative.views_75_percent,
        creative.views_total,
        creative.clicks,
        creative.pr_hook_rate.toFixed(1),
        creative.hook_rate.toFixed(1),
        creative.body_rate.toFixed(1),
        creative.cta_rate.toFixed(1),
        creative.ctr.toFixed(2),
        creative.conv_body_rate.toFixed(2),
        creative.sales_count,
        creative.gross_sales.toFixed(2),
        creative.profit.toFixed(2),
        creative.cpa.toFixed(2),
        creative.roi.toFixed(2),
        creative.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `criativos-completo-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <PermissionWrapper chartType="performance_overview" page="creatives">
        <CreativesSummaryCards 
          totalMetrics={totalMetrics}
          avgROI={avgROI}
        />
      </PermissionWrapper>

      <PermissionWrapper chartType="metrics_comparison" page="creatives">
        <MetricsOverviewCharts creatives={filteredCreatives} />
      </PermissionWrapper>

      <PermissionWrapper chartType="time_series" page="creatives">
        <TimeSeriesChart 
          creatives={filteredCreatives}
          dateRange={dateRange}
        />
      </PermissionWrapper>

      <CreativesFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showZeroValues={showZeroValues}
        onShowZeroValuesChange={setShowZeroValues}
      />

      <CreativesTable 
        creatives={creatives}
        filteredCreatives={filteredCreatives}
        loading={loading}
        onExportCSV={exportToCSV}
      />
    </div>
  );
};
