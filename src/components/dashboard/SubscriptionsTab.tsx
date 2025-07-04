
import React, { useState } from 'react';
import { SubscriptionsSummaryCards } from "./subscriptions/SubscriptionsSummaryCards";
import { SubscriptionsTable } from "./subscriptions/SubscriptionsTable";
import { SubscriptionRenewalsSummaryCards } from "./subscriptions/SubscriptionRenewalsSummaryCards";
import { SubscriptionRenewalsTable } from "./subscriptions/SubscriptionRenewalsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubscriptionsTabProps {
  dateRange: { from: Date; to: Date };
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({ dateRange }) => {
  // Default filters without product selection
  const filters = {
    plan: "all",
    eventType: "all",
    paymentMethod: "all",
    status: "all"
  };

  return (
    <div className="space-y-6">
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
