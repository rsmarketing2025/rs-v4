
import React, { useState } from 'react';
import { SubscriptionFilters } from "./subscriptions/SubscriptionFilters";
import { SubscriptionsSummaryCards } from "./subscriptions/SubscriptionsSummaryCards";
import { SubscriptionsChart } from "./subscriptions/SubscriptionsChart";
import { SubscriptionsTable } from "./subscriptions/SubscriptionsTable";
import { SubscriptionRenewalsSummaryCards } from "./subscriptions/SubscriptionRenewalsSummaryCards";
import { SubscriptionRenewalsChart } from "./subscriptions/SubscriptionRenewalsChart";
import { SubscriptionRenewalsLineChart } from "./subscriptions/SubscriptionRenewalsLineChart";
import { SubscriptionRenewalsTable } from "./subscriptions/SubscriptionRenewalsTable";
import { ProductSalesSummaryCards } from "./subscriptions/ProductSalesSummaryCards";
import { ProductSalesChart } from "./subscriptions/ProductSalesChart";
import { ProductSalesTable } from "./subscriptions/ProductSalesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMonthlyKPIs } from "@/hooks/useMonthlyKPIs";

interface SubscriptionsTabProps {
  dateRange: { from: Date; to: Date };
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({ dateRange }) => {
  const [filters, setFilters] = useState({
    plan: "all",
    eventType: "all",
    paymentMethod: "all",
    status: "all"
  });

  const [productFilters, setProductFilters] = useState({
    product: "all",
    eventType: "all",
    paymentMethod: "all",
    status: "all"
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  
  // Get total sales revenue for the line chart
  const { kpis } = useMonthlyKPIs(dateRange);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-700">
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
          <TabsTrigger 
            value="products" 
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
          >
            Produtos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscriptions" className="space-y-6 mt-6">
          <SubscriptionFilters 
            filters={filters} 
            onFiltersChange={setFilters}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showProductFilter={false}
          />
          <SubscriptionsSummaryCards dateRange={dateRange} filters={filters} />
          <SubscriptionsChart dateRange={dateRange} filters={filters} type="subscriptions" />
          <SubscriptionsTable 
            dateRange={dateRange} 
            filters={filters} 
            searchTerm={searchTerm} 
          />
        </TabsContent>
        
        <TabsContent value="renewals" className="space-y-6 mt-6">
          <SubscriptionFilters 
            filters={filters} 
            onFiltersChange={setFilters}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showProductFilter={false}
          />
          <SubscriptionRenewalsSummaryCards dateRange={dateRange} filters={filters} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubscriptionRenewalsLineChart 
              dateRange={dateRange} 
              totalSalesRevenue={kpis.totalRevenue}
            />
            <SubscriptionRenewalsChart dateRange={dateRange} filters={filters} />
          </div>
          <SubscriptionRenewalsTable 
            dateRange={dateRange} 
            filters={filters} 
            searchTerm={searchTerm} 
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-6 mt-6">
          <SubscriptionFilters 
            filters={productFilters} 
            onFiltersChange={setProductFilters}
            searchTerm={productSearchTerm}
            onSearchChange={setProductSearchTerm}
            showProductFilter={true}
          />
          <ProductSalesSummaryCards dateRange={dateRange} filters={productFilters} />
          <ProductSalesChart dateRange={dateRange} filters={productFilters} />
          <ProductSalesTable 
            dateRange={dateRange} 
            filters={productFilters} 
            searchTerm={productSearchTerm} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
