
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  MousePointer, 
  Target,
  BarChart3,
  Settings
} from "lucide-react";
import { CreativesTab } from "@/components/dashboard/CreativesTab";
import { SalesTab } from "@/components/dashboard/SalesTab";
import { AffiliatesTab } from "@/components/dashboard/AffiliatesTab";
import { UsersTab } from "@/components/dashboard/UsersTab";
import { BusinessManagersTab } from "@/components/dashboard/BusinessManagersTab";
import { KPICard } from "@/components/dashboard/KPICard";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useMonthlyKPIs } from "@/hooks/useMonthlyKPIs";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { hasPageAccess, loading: permissionsLoading } = usePermissions();
  const { kpis, loading: kpisLoading } = useMonthlyKPIs();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Set active tab based on current route
    if (location.pathname === '/users') return "users";
    if (location.pathname === '/business-managers') return "business-managers";
    return "creatives";
  });
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  // Update URL when tab changes
  React.useEffect(() => {
    if (activeTab === "users") {
      window.history.pushState({}, '', '/users');
    } else if (activeTab === "business-managers") {
      window.history.pushState({}, '', '/business-managers');
    } else {
      window.history.pushState({}, '', '/dashboard');
    }
  }, [activeTab]);

  // Show users page when on /users route
  if (location.pathname === '/users' && isAdmin && hasPageAccess('users')) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-slate-50 light:via-slate-100 light:to-slate-50">
          <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white dark:text-white light:text-slate-900" />
                <div>
                  <h1 className="text-5xl font-bold text-white dark:text-white light:text-slate-900 mb-2">
                    Manager
                  </h1>
                  <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-lg">
                    Gerenciamento de usuários
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <ThemeToggle />
              </div>
            </div>

            {/* Users Content */}
            <Card className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 backdrop-blur-sm">
              <CardContent className="p-6">
                <UsersTab />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    );
  }

  // Show business managers page when on /business-managers route
  if (location.pathname === '/business-managers' && isAdmin && hasPageAccess('businessManagers')) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-slate-50 light:via-slate-100 light:to-slate-50">
          <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white dark:text-white light:text-slate-900" />
                <div>
                  <h1 className="text-5xl font-bold text-white dark:text-white light:text-slate-900 mb-2">
                    Manager
                  </h1>
                  <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-lg">
                    Gerenciamento de Business Managers
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <ThemeToggle />
              </div>
            </div>

            {/* Business Managers Content */}
            <Card className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 backdrop-blur-sm">
              <CardContent className="p-6">
                <BusinessManagersTab />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    );
  }

  // Redirect to access denied if user doesn't have permission
  if (!permissionsLoading && !hasPageAccess('creatives')) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
            <p className="text-slate-400">Você não tem permissão para acessar esta página.</p>
          </Card>
        </div>
      </SidebarInset>
    );
  }

  if (permissionsLoading) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-white text-lg">Carregando permissões...</div>
        </div>
      </SidebarInset>
    );
  }

  // Determine available tabs based on permissions
  const availableTabs = [
    { id: 'creatives', label: 'Criativos', icon: Eye, hasAccess: hasPageAccess('creatives') },
    { id: 'sales', label: 'Vendas', icon: DollarSign, hasAccess: hasPageAccess('sales') },
    { id: 'affiliates', label: 'Afiliados', icon: Users, hasAccess: hasPageAccess('affiliates') },
  ].filter(tab => tab.hasAccess);

  // Set default tab to first available tab
  React.useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  return (
    <SidebarInset>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-slate-50 light:via-slate-100 light:to-slate-50">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white dark:text-white light:text-slate-900" />
              <div>
                <h1 className="text-5xl font-bold text-white dark:text-white light:text-slate-900 mb-2">
                  Manager
                </h1>
                <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-lg">
                  Insights detalhados de Criativos e Métricas de vendas
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <DateRangePicker 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange} 
              />
              <ThemeToggle />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <KPICard
              title="Total Investido"
              value={kpisLoading ? "Carregando..." : `R$ ${kpis.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              change={kpisLoading ? "..." : "+12.5%"}
              icon={DollarSign}
              trend="up"
            />
            <KPICard
              title="Receita Total"
              value={kpisLoading ? "Carregando..." : `R$ ${kpis.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              change={kpisLoading ? "..." : "+18.2%"}
              icon={TrendingUp}
              trend="up"
            />
            <KPICard
              title="Total de Pedidos"
              value={kpisLoading ? "Carregando..." : kpis.totalOrders.toLocaleString()}
              change={kpisLoading ? "..." : "+15.8%"}
              icon={Target}
              trend="up"
            />
            <KPICard
              title="ROAS"
              value={kpisLoading ? "Carregando..." : `${kpis.roas.toFixed(2)}x`}
              change={kpisLoading ? "..." : "+0.3x"}
              icon={BarChart3}
              trend="up"
            />
            <KPICard
              title="Taxa de Conversão"
              value={kpisLoading ? "Carregando..." : `${kpis.conversionRate.toFixed(1)}%`}
              change={kpisLoading ? "..." : "+0.8%"}
              icon={MousePointer}
              trend="up"
            />
            <KPICard
              title="Ticket Médio"
              value={kpisLoading ? "Carregando..." : `R$ ${kpis.avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              change={kpisLoading ? "..." : "+5.2%"}
              icon={DollarSign}
              trend="up"
            />
          </div>

          {/* Main Content Tabs */}
          <Card className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 backdrop-blur-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
        </div>
      </div>
    </SidebarInset>
  );
};

export default Dashboard;
