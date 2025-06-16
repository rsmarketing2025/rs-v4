
import React, { useState } from 'react';
import { MetricsOverviewCharts } from "./creatives/MetricsOverviewCharts";
import { TimeSeriesChart } from "./creatives/TimeSeriesChart";
import { CreativesFilters } from "./creatives/CreativesFilters";
import { CreativesTable } from "./creatives/CreativesTable";
import { useCreativesData } from "@/hooks/useCreativesData";

interface CreativesTabProps {
  dateRange: { from: Date; to: Date };
}

export const CreativesTab: React.FC<CreativesTabProps> = ({ dateRange }) => {
  const { creatives, loading } = useCreativesData(dateRange);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCreatives = creatives.filter(creative => {
    const matchesSearch = creative.creative_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creative.campaign_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || creative.status === statusFilter;
    
    // Show all creatives based only on search and status filters
    return matchesSearch && matchesStatus;
  });

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
      <MetricsOverviewCharts creatives={filteredCreatives} />

      <TimeSeriesChart 
        creatives={filteredCreatives}
        dateRange={dateRange}
      />

      <CreativesFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showZeroValues={false}
        onShowZeroValuesChange={() => {}}
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
