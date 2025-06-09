
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
  Settings,
  Calendar
} from "lucide-react";
import { CreativesTab } from "@/components/dashboard/CreativesTab";
import { SalesTab } from "@/components/dashboard/SalesTab";
import { AffiliatesTab } from "@/components/dashboard/AffiliatesTab";
import { SubscriptionsTab } from "@/components/dashboard/SubscriptionsTab";
import { UsersTab } from "@/components/dashboard/UsersTab";
import { BusinessManagersTab } from "@/components/dashboard/BusinessManagersTab";
import { KPICard } from "@/components/dashboard/KPICard";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useMonthlyKPIs } from "@/hooks/useMonthlyKPIs";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { canAccessPage } = usePermissions();
  const { kpis, loading: kpisLoading } = useMonthlyKPIs();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === '/users') return "users";
    if (location.pathname === '/business-managers') return "business-managers";
    return "creatives";
  });
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  React.useEffect(() => {
    if (activeTab === "users") {
      window.history.pushState({}, '', '/users');
    } else if (activeTab === "business-managers") {
      window.history.pushState({}, '', '/business-managers');
    } else {
      window.history.pushState({}, '', '/dashboard');
    }
  }, [activeTab]);

  // Função para obter o título da página atual
  const getPageTitle = () => {
    if (location.pathname === '/users') return "Usuários";
    if (location.pathname === '/business-managers') return "Business Managers";
    return "Performance";
  };

  // Função para obter a descrição da página atual
  const getPageDescription = () => {
    if (location.pathname === '/users') return "Gerenciamento de usuários";
    if (location.pathname === '/business-managers') return "Gerenciamento de Business Managers";
    return "Insights detalhados de Criativos e Métricas de vendas";
  };

  // Verificar acesso às páginas especiais
  if (location.pathname === '/users') {
    if (!isAdmin && !canAccessPage('users')) {
      return (
        <SidebarInset>
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
              <p className="text-slate-400">Você não tem permissão para acessar esta página.</p>
            </div>
          </div>
        </SidebarInset>
      );
    }
    
    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="container mx-auto p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white" />
                <div>
                  <h1 className="text-5xl font-bold text-white mb-2">{getPageTitle()}</h1>
                  <p className="text-slate-400 text-lg">{getPageDescription()}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <ThemeToggle />
              </div>
            </div>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardContent className="p-6">
                <UsersTab />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (location.pathname === '/business-managers') {
    if (!isAdmin && !canAccessPage('business-managers')) {
      return (
        <SidebarInset>
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
              <p className="text-slate-400">Você não tem permissão para acessar esta página.</p>
            </div>
          </div>
        </SidebarInset>
      );
    }

    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="container mx-auto p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white" />
                <div>
                  <h1 className="text-5xl font-bold text-white mb-2">{getPageTitle()}</h1>
                  <p className="text-slate-400 text-lg">{getPageDescription()}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <ThemeToggle />
              </div>
            </div>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardContent className="p-6">
                <BusinessManagersTab />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white" />
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">{getPageTitle()}</h1>
                <p className="text-slate-400 text-lg">{getPageDescription()}</p>
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

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                  <PermissionWrapper requirePage="creatives" fallback={null}>
                    <TabsTrigger value="creatives" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                      <Eye className="w-4 h-4 mr-2" />
                      Criativos
                    </TabsTrigger>
                  </PermissionWrapper>
                  <PermissionWrapper requirePage="sales" fallback={null}>
                    <TabsTrigger value="sales" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Vendas
                    </TabsTrigger>
                  </PermissionWrapper>
                  <PermissionWrapper requirePage="affiliates" fallback={null}>
                    <TabsTrigger value="affiliates" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                      <Users className="w-4 h-4 mr-2" />
                      Afiliados
                    </TabsTrigger>
                  </PermissionWrapper>
                  <PermissionWrapper requirePage="subscriptions" fallback={null}>
                    <TabsTrigger value="subscriptions" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                      <Calendar className="w-4 h-4 mr-2" />
                      Assinaturas
                    </TabsTrigger>
                  </PermissionWrapper>
                </TabsList>
              </CardHeader>

              <CardContent className="p-6">
                <PermissionWrapper requirePage="creatives">
                  <TabsContent value="creatives" className="mt-0">
                    <CreativesTab dateRange={dateRange} />
                  </TabsContent>
                </PermissionWrapper>
                
                <PermissionWrapper requirePage="sales">
                  <TabsContent value="sales" className="mt-0">
                    <SalesTab dateRange={dateRange} />
                  </TabsContent>
                </PermissionWrapper>
                
                <PermissionWrapper requirePage="affiliates">
                  <TabsContent value="affiliates" className="mt-0">
                    <AffiliatesTab dateRange={dateRange} />
                  </TabsContent>
                </PermissionWrapper>

                <PermissionWrapper requirePage="subscriptions">
                  <TabsContent value="subscriptions" className="mt-0">
                    <SubscriptionsTab dateRange={dateRange} />
                  </TabsContent>
                </PermissionWrapper>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
};

export default Dashboard;
