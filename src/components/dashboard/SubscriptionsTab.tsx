
import React, { useState } from 'react';
import { SubscriptionFilters } from "./subscriptions/SubscriptionFilters";
import { SubscriptionsSummaryCards } from "./subscriptions/SubscriptionsSummaryCards";
import { SubscriptionsChart } from "./subscriptions/SubscriptionsChart";
import { SubscriptionsTable } from "./subscriptions/SubscriptionsTable";
import { SubscriptionRenewalsSummaryCards } from "./subscriptions/SubscriptionRenewalsSummaryCards";
import { SubscriptionRenewalsChart } from "./subscriptions/SubscriptionRenewalsChart";
import { SubscriptionRenewalsTable } from "./subscriptions/SubscriptionRenewalsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <SubscriptionFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
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
          <SubscriptionsChart dateRange={dateRange} filters={filters} />
          <SubscriptionsTable 
            dateRange={dateRange} 
            filters={filters} 
            searchTerm={searchTerm} 
          />
        </TabsContent>
        
        <TabsContent value="renewals" className="space-y-6 mt-6">
          <SubscriptionRenewalsSummaryCards dateRange={dateRange} filters={filters} />
          <SubscriptionRenewalsChart dateRange={dateRange} filters={filters} />
          <SubscriptionRenewalsTable 
            dateRange={dateRange} 
            filters={filters} 
            searchTerm={searchTerm} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
