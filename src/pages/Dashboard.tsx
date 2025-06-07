
import React, { useState } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { 
  DollarSign, 
  Users, 
  Eye
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useMonthlyKPIs } from "@/hooks/useMonthlyKPIs";
import { useLocation } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardKPISection } from "@/components/dashboard/DashboardKPISection";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardRoutes } from "@/components/dashboard/DashboardRoutes";
import { DashboardLoadingState } from "@/components/dashboard/DashboardLoadingState";

const Dashboard = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP - NO CONDITIONAL HOOKS
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

  // NOW HANDLE CONDITIONAL RENDERING AFTER ALL HOOKS
  if (permissionsLoading) {
    return <DashboardLoadingState type="loading" />;
  }

  // Handle route-specific pages
  const routeComponent = (
    <DashboardRoutes
      pathname={location.pathname}
      isAdmin={isAdmin}
      hasPageAccess={hasPageAccess}
    />
  );
  
  if (routeComponent) {
    return routeComponent;
  }

  // Redirect to access denied if user doesn't have permission
  if (!hasPageAccess('creatives')) {
    return <DashboardLoadingState type="access-denied" />;
  }

  return (
    <SidebarInset>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-slate-50 light:via-slate-100 light:to-slate-50">
        <div className="container mx-auto p-6">
          <DashboardHeader
            title="Manager"
            description="Insights detalhados de Criativos e Métricas de vendas"
            showDatePicker={true}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />

          <DashboardKPISection
            kpis={kpis}
            loading={kpisLoading}
          />

          <DashboardContent
            activeTab={activeTab}
            onTabChange={setActiveTab}
            availableTabs={availableTabs}
            dateRange={dateRange}
            hasPageAccess={hasPageAccess}
          />
        </div>
      </div>
    </SidebarInset>
  );
};

export default Dashboard;
