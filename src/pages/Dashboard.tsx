
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { CreativesTab } from "@/components/dashboard/CreativesTab";
import { SalesTab } from "@/components/dashboard/SalesTab";
import { AffiliatesTab } from "@/components/dashboard/AffiliatesTab";
import { SubscriptionsTab } from "@/components/dashboard/SubscriptionsTab";
import { BusinessManagersTab } from "@/components/dashboard/BusinessManagersTab";
import { UsersTab } from "@/components/dashboard/UsersTab";
import { ProtectedPage } from "@/components/auth/ProtectedPage";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocation } from "react-router-dom";
import { addDays } from "date-fns";

const Dashboard = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { hasPageAccess, loading } = usePermissions();
  
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Determinar qual tab mostrar baseado na rota
  const getActiveTab = () => {
    if (location.pathname === "/users") return "users";
    if (location.pathname === "/business-managers") return "business-managers";
    return "performance";
  };

  const activeTab = getActiveTab();

  // Mostrar loading se ainda estiver carregando permissões
  if (loading) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-white text-lg">Carregando dashboard...</div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-700 bg-slate-900/50 px-4">
        <SidebarTrigger className="-ml-1 text-slate-400 hover:text-white" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-slate-600" />
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Tabs value={activeTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger 
                value="performance" 
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
              >
                Performance
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger 
                  value="business-managers" 
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
                >
                  Business Managers
                </TabsTrigger>
              )}
              {hasPageAccess('users') && (
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
                >
                  Usuários
                </TabsTrigger>
              )}
            </TabsList>
            
            {activeTab === "performance" && (
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            )}
          </div>

          <TabsContent value="performance" className="space-y-6">
            <Tabs defaultValue="creatives" className="w-full">
              <TabsList className="bg-slate-800 border-slate-700">
                {hasPageAccess('creatives') && (
                  <TabsTrigger 
                    value="creatives" 
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
                  >
                    Criativos
                  </TabsTrigger>
                )}
                {hasPageAccess('sales') && (
                  <TabsTrigger 
                    value="sales" 
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
                  >
                    Vendas
                  </TabsTrigger>
                )}
                {hasPageAccess('affiliates') && (
                  <TabsTrigger 
                    value="affiliates" 
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
                  >
                    Afiliados
                  </TabsTrigger>
                )}
                {hasPageAccess('revenue') && (
                  <TabsTrigger 
                    value="subscriptions" 
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
                  >
                    Receita
                  </TabsTrigger>
                )}
              </TabsList>

              {hasPageAccess('creatives') && (
                <TabsContent value="creatives">
                  <ProtectedPage page="creatives">
                    <CreativesTab dateRange={dateRange} />
                  </ProtectedPage>
                </TabsContent>
              )}

              {hasPageAccess('sales') && (
                <TabsContent value="sales">
                  <ProtectedPage page="sales">
                    <SalesTab dateRange={dateRange} />
                  </ProtectedPage>
                </TabsContent>
              )}

              {hasPageAccess('affiliates') && (
                <TabsContent value="affiliates">
                  <ProtectedPage page="affiliates">
                    <AffiliatesTab dateRange={dateRange} />
                  </ProtectedPage>
                </TabsContent>
              )}

              {hasPageAccess('revenue') && (
                <TabsContent value="subscriptions">
                  <ProtectedPage page="revenue">
                    <SubscriptionsTab dateRange={dateRange} />
                  </ProtectedPage>
                </TabsContent>
              )}
            </Tabs>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="business-managers">
              <BusinessManagersTab />
            </TabsContent>
          )}

          <TabsContent value="users">
            <ProtectedPage page="users">
              <UsersTab />
            </ProtectedPage>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  );
};

export default Dashboard;
