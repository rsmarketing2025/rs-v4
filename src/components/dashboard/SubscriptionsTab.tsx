
import React, { useState } from 'react';
import { ProductFilter } from "./subscriptions/ProductFilter";
import { SubscriptionsSummaryCards } from "./subscriptions/SubscriptionsSummaryCards";
import { SubscriptionsTable } from "./subscriptions/SubscriptionsTable";
import { SubscriptionRenewalsSummaryCards } from "./subscriptions/SubscriptionRenewalsSummaryCards";
import { SubscriptionRenewalsLineChart } from "./subscriptions/SubscriptionRenewalsLineChart";
import { SubscriptionRenewalsTable } from "./subscriptions/SubscriptionRenewalsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMonthlyKPIs } from "@/hooks/useMonthlyKPIs";

interface SubscriptionsTabProps {
  dateRange: { from: Date; to: Date };
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({ dateRange }) => {
  const [selectedProduct, setSelectedProduct] = useState("all");
  
  // Get total sales revenue for the line chart
  const { kpis } = useMonthlyKPIs(dateRange);

  // Convert product filter to the format expected by existing components
  const filters = {
    plan: selectedProduct,
    eventType: "all",
    paymentMethod: "all",
    status: "all"
  };

  return (
    <div className="space-y-6">
      <ProductFilter 
        selectedProduct={selectedProduct}
        onProductChange={setSelectedProduct}
      />
      
      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700">
          <TabsTrigger 
            value="subscriptions" 
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
          >
            Assinaturas
          </TabsTrigger>
          <TabsTrigger 
            value="renewals" 
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
          >
            Renovações
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscriptions" className="space-y-6 mt-6">
          <SubscriptionsSummaryCards dateRange={dateRange} filters={filters} />
          <SubscriptionsTable 
            dateRange={dateRange} 
            filters={filters} 
            searchTerm="" 
          />
        </TabsContent>
        
        <TabsContent value="renewals" className="space-y-6 mt-6">
          <SubscriptionRenewalsSummaryCards dateRange={dateRange} filters={filters} />
          <SubscriptionRenewalsLineChart 
            dateRange={dateRange} 
            totalSalesRevenue={kpis.totalRevenue}
          />
          <SubscriptionRenewalsTable 
            dateRange={dateRange} 
            filters={filters} 
            searchTerm="" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
