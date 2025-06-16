
import React, { useState } from 'react';
import { CreativesFilters } from "./creatives/CreativesFilters";
import { CreativesTable } from "./creatives/CreativesTable";
import { TopTenChart } from "./creatives/TopTenChart";
import { ImprovedMetricsOverviewCharts } from "./creatives/ImprovedMetricsOverviewCharts";
import { CreativesSummaryCards } from "./creatives/CreativesSummaryCards";
import { TimeSeriesChart } from "./creatives/TimeSeriesChart";
import { useCreativesData } from "@/hooks/useCreativesData";

interface CreativesTabProps {
  dateRange: { from: Date; to: Date };
}

export const CreativesTab: React.FC<CreativesTabProps> = ({ dateRange }) => {
  const [creativesFilter, setCreativesFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("amount_spent");
  
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
    <div className="space-y-6">
      <CreativesSummaryCards 
        totalMetrics={totalMetrics} 
        avgROI={avgROI}
      />
      
      <ImprovedMetricsOverviewCharts 
        creatives={creatives} 
        dateRange={dateRange}
      />
      
      <TopTenChart 
        creatives={creatives}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
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
