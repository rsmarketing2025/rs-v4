
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
  BarChart3
} from "lucide-react";
import { CreativesTab } from "@/components/dashboard/CreativesTab";
import { SalesTab } from "@/components/dashboard/SalesTab";
import { AffiliatesTab } from "@/components/dashboard/AffiliatesTab";
import { UsersTab } from "@/components/dashboard/UsersTab";
import { KPICard } from "@/components/dashboard/KPICard";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Set active tab based on current route
    if (location.pathname === '/users') return "users";
    return "creatives";
  });
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  // Mock KPI data - will be replaced with real data from Supabase
  const kpis = {
    totalSpent: 42580.50,
    totalRevenue: 128450.75,
    totalOrders: 456,
    roas: 3.02,
    conversionRate: 4.8,
    avgOrderValue: 281.69
  };

  // Update URL when tab changes
  React.useEffect(() => {
    if (activeTab === "users") {
      window.history.pushState({}, '', '/users');
    } else {
      window.history.pushState({}, '', '/dashboard');
    }
  }, [activeTab]);

  // Show users page when on /users route
  if (location.pathname === '/users' && isAdmin) {
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
                    DW Marketing
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
                  DW Marketing
                </h1>
                <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-lg">
                  Insights abrangentes para suas campanhas criativas
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
              value={`R$ ${kpis.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              change="+12.5%"
              icon={DollarSign}
              trend="up"
            />
            <KPICard
              title="Receita Total"
              value={`R$ ${kpis.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              change="+18.2%"
              icon={TrendingUp}
              trend="up"
            />
            <KPICard
              title="Total de Pedidos"
              value={kpis.totalOrders.toLocaleString()}
              change="+15.8%"
              icon={Target}
              trend="up"
            />
            <KPICard
              title="ROAS"
              value={`${kpis.roas.toFixed(2)}x`}
              change="+0.3x"
              icon={BarChart3}
              trend="up"
            />
            <KPICard
              title="Taxa de Conversão"
              value={`${kpis.conversionRate}%`}
              change="+0.8%"
              icon={MousePointer}
              trend="up"
            />
            <KPICard
              title="Ticket Médio"
              value={`R$ ${kpis.avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              change="+5.2%"
              icon={DollarSign}
              trend="up"
            />
          </div>

          {/* Main Content Tabs */}
          <Card className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 backdrop-blur-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-100">
                  <TabsTrigger value="creatives" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                    <Eye className="w-4 h-4 mr-2" />
                    Criativos
                  </TabsTrigger>
                  <TabsTrigger value="sales" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Vendas
                  </TabsTrigger>
                  <TabsTrigger value="affiliates" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                    <Users className="w-4 h-4 mr-2" />
                    Afiliados
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-6">
                <TabsContent value="creatives" className="mt-0">
                  <CreativesTab dateRange={dateRange} />
                </TabsContent>
                
                <TabsContent value="sales" className="mt-0">
                  <SalesTab dateRange={dateRange} />
                </TabsContent>
                
                <TabsContent value="affiliates" className="mt-0">
                  <AffiliatesTab dateRange={dateRange} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
};

export default Dashboard;
