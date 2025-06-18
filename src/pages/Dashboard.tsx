
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
import { startOfDay, endOfDay } from "date-fns";

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { canAccessPage } = usePermissions();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === '/users') return "users";
    if (location.pathname === '/business-managers') return "business-managers";
    return "creatives";
  });
  
  // Função para obter o período "hoje" por padrão
  const getTodayRange = () => ({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });
  
  const [dateRange, setDateRange] = useState(getTodayRange);

  const { kpis, loading: kpisLoading } = useMonthlyKPIs(dateRange);

  // Função para resetar o período para "hoje" sempre que necessário
  const resetToToday = () => {
    setDateRange(getTodayRange());
  };

  React.useEffect(() => {
    if (activeTab === "users") {
      window.history.pushState({}, '', '/users');
    } else if (activeTab === "business-managers") {
      window.history.pushState({}, '', '/business-managers');
    } else {
      window.history.pushState({}, '', '/dashboard');
    }
    
    // Sempre que a aba mudar, resetar para "hoje"
    resetToToday();
  }, [activeTab]);

  // Resetar para "hoje" sempre que o componente for montado/atualizado
  React.useEffect(() => {
    resetToToday();
  }, []);

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
    return "Visão geral dos principais indicadores de performance";
  };

  // Verificar acesso às páginas especiais
  if (location.pathname === '/users') {
    if (!isAdmin && !canAccessPage('users')) {
      return (
        <SidebarInset>
          <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold text-white mb-4">Acesso Negado</h1>
              <p className="text-gray-400 text-sm md:text-base">Você não tem permissão para acessar esta página.</p>
            </div>
          </div>
        </SidebarInset>
      );
    }
    
    return (
      <SidebarInset>
        <div className="min-h-screen bg-black">
          <div className="container mx-auto p-3 md:p-6">
            <div className="flex flex-col space-y-4 mb-6 md:mb-8">
              <div className="flex items-center gap-2 md:gap-4">
                <SidebarTrigger className="text-white" />
                <div className="flex-1">
                  <h1 className="text-2xl md:text-5xl font-bold text-white mb-1 md:mb-2">{getPageTitle()}</h1>
                  <p className="text-gray-400 text-sm md:text-lg">{getPageDescription()}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <ThemeToggle />
              </div>
            </div>
            <Card className="bg-neutral-900 border-neutral-700 backdrop-blur-sm">
              <CardContent className="p-3 md:p-6">
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
          <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold text-white mb-4">Acesso Negado</h1>
              <p className="text-gray-400 text-sm md:text-base">Você não tem permissão para acessar esta página.</p>
            </div>
          </div>
        </SidebarInset>
      );
    }

    return (
      <SidebarInset>
        <div className="min-h-screen bg-black">
          <div className="container mx-auto p-3 md:p-6">
            <div className="flex flex-col space-y-4 mb-6 md:mb-8">
              <div className="flex items-center gap-2 md:gap-4">
                <SidebarTrigger className="text-white" />
                <div className="flex-1">
                  <h1 className="text-2xl md:text-5xl font-bold text-white mb-1 md:mb-2">{getPageTitle()}</h1>
                  <p className="text-gray-400 text-sm md:text-lg">{getPageDescription()}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <ThemeToggle />
              </div>
            </div>
            <Card className="bg-neutral-900 border-neutral-700 backdrop-blur-sm">
              <CardContent className="p-3 md:p-6">
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
      <div className="min-h-screen bg-black">
        <div className="container mx-auto p-3 md:p-6">
          <div className="flex flex-col space-y-4 mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="text-white" />
              <div className="flex-1">
                <h1 className="text-2xl md:text-5xl font-bold text-white mb-1 md:mb-2">{getPageTitle()}</h1>
                <p className="text-gray-400 text-sm md:text-lg">{getPageDescription()}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <div className="order-2 sm:order-1">
                <DateRangePicker 
                  dateRange={dateRange} 
                  onDateRangeChange={setDateRange} 
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToToday}
                className="bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800 order-1 sm:order-2"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Hoje
              </Button>
              <div className="order-3">
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <KPICard
              title="Total Investido"
              value={kpisLoading ? "Carregando..." : `R$ ${kpis.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              change={kpisLoading ? "..." : "+12.5%"}
              icon={DollarSign}
              trend="up"
              variant="success"
            />
            <KPICard
              title="Receita Total"
              value={kpisLoading ? "Carregando..." : `R$ ${kpis.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              change={kpisLoading ? "..." : "+18.2%"}
              icon={TrendingUp}
              trend="up"
              variant="orange"
            />
            <KPICard
              title="Total de Pedidos"
              value={kpisLoading ? "Carregando..." : kpis.totalOrders.toLocaleString()}
              change={kpisLoading ? "..." : "+15.8%"}
              icon={Target}
              trend="up"
              variant="purple"
            />
            <KPICard
              title="ROI Médio"
              value={kpisLoading ? "Carregando..." : `${kpis.avgROI.toFixed(2)}x`}
              change={kpisLoading ? "..." : "+0.3x"}
              icon={BarChart3}
              trend="up"
              variant="black"
            />
          </div>

          <Card className="bg-neutral-900 border-neutral-700 backdrop-blur-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="pb-3 md:pb-4">
                <div className="overflow-x-auto">
                  <TabsList className="grid w-full grid-cols-4 bg-neutral-800 min-w-[400px] sm:min-w-0">
                    <PermissionWrapper requirePage="creatives" fallback={null}>
                      <TabsTrigger value="creatives" className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-gray-300 text-xs sm:text-sm">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Criativos</span>
                        <span className="sm:hidden">Creat.</span>
                      </TabsTrigger>
                    </PermissionWrapper>
                    <PermissionWrapper requirePage="sales" fallback={null}>
                      <TabsTrigger value="sales" className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-gray-300 text-xs sm:text-sm">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Vendas</span>
                        <span className="sm:hidden">Vend.</span>
                      </TabsTrigger>
                    </PermissionWrapper>
                    <PermissionWrapper requirePage="affiliates" fallback={null}>
                      <TabsTrigger value="affiliates" className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-gray-300 text-xs sm:text-sm">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Afiliados</span>
                        <span className="sm:hidden">Afil.</span>
                      </TabsTrigger>
                    </PermissionWrapper>
                    <PermissionWrapper requirePage="subscriptions" fallback={null}>
                      <TabsTrigger value="subscriptions" className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-gray-300 text-xs sm:text-sm">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Assinaturas</span>
                        <span className="sm:hidden">Assin.</span>
                      </TabsTrigger>
                    </PermissionWrapper>
                  </TabsList>
                </div>
              </CardHeader>

              <CardContent className="p-3 md:p-6">
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
