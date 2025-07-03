
import React, { useState } from 'react';
import { SubscriptionFilters } from "./subscriptions/SubscriptionFilters";
import { RenewalFilters } from "./subscriptions/RenewalFilters";
import { SubscriptionsSummaryCards } from "./subscriptions/SubscriptionsSummaryCards";
import { SubscriptionsChart } from "./subscriptions/SubscriptionsChart";
import { SubscriptionsTable } from "./subscriptions/SubscriptionsTable";
import { SubscriptionRenewalsSummaryCards } from "./subscriptions/SubscriptionRenewalsSummaryCards";
import { SubscriptionRenewalsChart } from "./subscriptions/SubscriptionRenewalsChart";
import { SubscriptionRenewalsLineChart } from "./subscriptions/SubscriptionRenewalsLineChart";
import { SubscriptionRenewalsTable } from "./subscriptions/SubscriptionRenewalsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMonthlyKPIs } from "@/hooks/useMonthlyKPIs";

interface SubscriptionsTabProps {
  dateRange: { from: Date; to: Date };
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({ dateRange }) => {
  // Separate filter states for each tab
  const [subscriptionFilters, setSubscriptionFilters] = useState({
    plan: "all",
    eventType: "all",
    paymentMethod: "all",
    status: "all",
    products: [] as string[]
  });

  const [renewalFilters, setRenewalFilters] = useState({
    plan: "all",
    eventType: "all",
    paymentMethod: "all",
    status: "all",
    products: [] as string[]
  });

  // Separate search terms for each tab
  const [subscriptionSearchTerm, setSubscriptionSearchTerm] = useState("");
  const [renewalSearchTerm, setRenewalSearchTerm] = useState("");
  
  // Get total sales revenue for the line chart
  const { kpis } = useMonthlyKPIs(dateRange);

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
          <SubscriptionFilters 
            filters={subscriptionFilters} 
            onFiltersChange={setSubscriptionFilters}
            searchTerm={subscriptionSearchTerm}
            onSearchChange={setSubscriptionSearchTerm}
          />
          <SubscriptionsSummaryCards dateRange={dateRange} filters={subscriptionFilters} />
          <SubscriptionsChart dateRange={dateRange} filters={subscriptionFilters} type="subscriptions" />
          <SubscriptionsTable 
            dateRange={dateRange} 
            filters={subscriptionFilters} 
            searchTerm={subscriptionSearchTerm} 
          />
        </TabsContent>
        
        <TabsContent value="renewals" className="space-y-6 mt-6">
          <RenewalFilters 
            filters={renewalFilters} 
            onFiltersChange={setRenewalFilters}
            searchTerm={renewalSearchTerm}
            onSearchChange={setRenewalSearchTerm}
          />
          <SubscriptionRenewalsSummaryCards dateRange={dateRange} filters={renewalFilters} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubscriptionRenewalsLineChart 
              dateRange={dateRange} 
              totalSalesRevenue={kpis.totalRevenue}
            />
            <SubscriptionRenewalsChart dateRange={dateRange} filters={renewalFilters} />
          </div>
          <SubscriptionRenewalsTable 
            dateRange={dateRange} 
            filters={renewalFilters} 
            searchTerm={renewalSearchTerm} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
