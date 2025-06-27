
import React, { useState } from 'react';
import { CreativesFilters } from "./creatives/CreativesFilters";
import { CreativesTable } from "./creatives/CreativesTable";
import { ImprovedMetricsOverviewCharts } from "./creatives/ImprovedMetricsOverviewCharts";
import { CreativesSummaryCards } from "./creatives/CreativesSummaryCards";
import { TimeSeriesChart } from "./creatives/TimeSeriesChart";
import { CreativesMetricsCards } from "./creatives/CreativesMetricsCards";
import { useCreativesData } from "@/hooks/useCreativesData";

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
      <CreativesMetricsCards 
        totalSpent={totalMetrics.spent}
        avgROI={globalKPIs.avgROI}
        loading={globalKPIsLoading}
      />
      
      <ImprovedMetricsOverviewCharts 
        creatives={creatives} 
        dateRange={dateRange}
      />
      
      <TimeSeriesChart 
        creatives={creatives}
        dateRange={dateRange}
      />
      
      <CreativesTable 
        creatives={creatives}
        loading={loading}
        filteredCreatives={creatives}
        onExportCSV={handleExportCSV}
      />
    </div>
  );
};
