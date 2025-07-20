
import React, { useState } from 'react';
import { CreativesFilters } from "./creatives/CreativesFilters";
import { CreativesTable } from "./creatives/CreativesTable";
import { ImprovedMetricsOverviewCharts } from "./creatives/ImprovedMetricsOverviewCharts";
import { CreativesSummaryCards } from "./creatives/CreativesSummaryCards";
import { TimeSeriesChart } from "./creatives/TimeSeriesChart";
import { CreativesMetricsCards } from "./creatives/CreativesMetricsCards";
import { useCreativesData } from "@/hooks/useCreativesData";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

interface CreativesTabProps {
  dateRange: { from: Date; to: Date };
  globalKPIs: {
    totalSpent: number;
    totalRevenue: number;
    totalOrders: number;
    avgROI: number;
  };
  globalKPIsLoading: boolean;
}

export const CreativesTab: React.FC<CreativesTabProps> = ({ 
  dateRange, 
  globalKPIs, 
  globalKPIsLoading 
}) => {
  const [creativesFilter, setCreativesFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { 
    creatives, 
    loading, 
    totalMetrics, 
    avgROI 
  } = useCreativesData(dateRange, creativesFilter, statusFilter);

  // Mock CSV export function
  const handleExportCSV = () => {
    console.log('Exporting CSV...');
  };

  return (
    <div className="space-y-6 bg-slate-900">
      <PermissionWrapper requirePage="kpis" fallback={
        <div className="bg-slate-800/30 rounded-lg p-4 text-center">
          <p className="text-slate-400">Sem permissão para visualizar métricas</p>
        </div>
      }>
        <CreativesMetricsCards 
          totalSpent={totalMetrics.spent}
          avgROI={globalKPIs.avgROI}
          loading={globalKPIsLoading}
        />
      </PermissionWrapper>
      
      <PermissionWrapper requirePage="charts" fallback={
        <div className="bg-slate-800/30 rounded-lg p-4 text-center">
          <p className="text-slate-400">Sem permissão para visualizar gráficos</p>
        </div>
      }>
        <ImprovedMetricsOverviewCharts 
          creatives={creatives} 
          dateRange={dateRange}
        />
        
        <TimeSeriesChart 
          creatives={creatives}
          dateRange={dateRange}
        />
      </PermissionWrapper>
      
      <PermissionWrapper requirePage="tables" fallback={
        <div className="bg-slate-800/30 rounded-lg p-4 text-center">
          <p className="text-slate-400">Sem permissão para visualizar tabelas</p>
        </div>
      }>
        <CreativesTable 
          creatives={creatives}
          loading={loading}
          filteredCreatives={creatives}
          onExportCSV={handleExportCSV}
        />
      </PermissionWrapper>
    </div>
  );
};
