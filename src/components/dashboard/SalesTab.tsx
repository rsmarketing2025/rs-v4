
import React, { useState } from 'react';
import { SalesFilters } from "./sales/SalesFilters";
import { SalesChart } from "./sales/SalesChart";
import { SalesTable } from "./sales/SalesTable";
import { SalesSummaryCards } from "./sales/SalesSummaryCards";
import { CreativesSalesChart } from "./CreativesSalesChart";
import { CountrySalesChart } from "./sales/CountrySalesChart";
import { StateSalesChart } from "./sales/StateSalesChart";
import { RegionalAnalysis } from "./sales/RegionalAnalysis";
import { AffiliatesSummaryCards } from "./sales/AffiliatesSummaryCards";
import { useSalesData } from "@/hooks/useSalesData";
import { useSalesRankingData } from "@/hooks/useSalesRankingData";

interface SalesTabProps {
  dateRange: { from: Date; to: Date };
}

export const SalesTab: React.FC<SalesTabProps> = ({ dateRange }) => {
  const [productFilter, setProductFilter] = useState<string[]>([]);
  const [stateFilter, setStateFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { 
    sales, 
    loading, 
    totalMetrics, 
    refetch: refetchSales 
  } = useSalesData(dateRange, productFilter, stateFilter, statusFilter);

  const { 
    rankingData, 
    loading: rankingLoading, 
    missingDataStats 
  } = useSalesRankingData(dateRange);

  // Mock CSV export function
  const handleExportCSV = () => {
    console.log('Exporting CSV...');
  };

  return (
    <div className="space-y-6">
      <SalesSummaryCards 
        totalMetrics={totalMetrics} 
        missingDataStats={missingDataStats}
      />
      
      <AffiliatesSummaryCards 
        sales={sales} 
        dateRange={dateRange}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart sales={sales} />
        <CreativesSalesChart dateRange={dateRange} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountrySalesChart dateRange={dateRange} />
        <StateSalesChart dateRange={dateRange} />
      </div>
      
      <RegionalAnalysis dateRange={dateRange} />
      
      <SalesTable 
        sales={sales}
        loading={loading}
        filteredSales={sales}
        onExportCSV={handleExportCSV}
      />
    </div>
  );
};
