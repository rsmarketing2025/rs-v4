
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Users, 
  Eye
} from "lucide-react";
import { CreativesTab } from "@/components/dashboard/CreativesTab";
import { SalesTab } from "@/components/dashboard/SalesTab";
import { AffiliatesTab } from "@/components/dashboard/AffiliatesTab";

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  hasAccess: boolean;
}

interface DashboardContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableTabs: TabConfig[];
  dateRange: {
    from: Date;
    to: Date;
  };
  hasPageAccess: (page: string) => boolean;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  onTabChange,
  availableTabs,
  dateRange,
  hasPageAccess,
}) => {
  return (
    <Card className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 backdrop-blur-sm">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <CardHeader className="pb-4">
          <TabsList className={`grid w-full grid-cols-${availableTabs.length} bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-100`}>
            {availableTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>

        <CardContent className="p-6">
          {hasPageAccess('creatives') && (
            <TabsContent value="creatives" className="mt-0">
              <CreativesTab dateRange={dateRange} />
            </TabsContent>
          )}
          
          {hasPageAccess('sales') && (
            <TabsContent value="sales" className="mt-0">
              <SalesTab dateRange={dateRange} />
            </TabsContent>
          )}
          
          {hasPageAccess('affiliates') && (
            <TabsContent value="affiliates" className="mt-0">
              <AffiliatesTab dateRange={dateRange} />
            </TabsContent>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
};
