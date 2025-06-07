
import React from 'react';
import { KPICard } from "@/components/dashboard/KPICard";
import { 
  TrendingUp, 
  DollarSign, 
  MousePointer, 
  Target,
  BarChart3
} from "lucide-react";

interface DashboardKPISectionProps {
  kpis: {
    totalSpent: number;
    totalRevenue: number;
    totalOrders: number;
    roas: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  loading: boolean;
}

export const DashboardKPISection: React.FC<DashboardKPISectionProps> = ({
  kpis,
  loading,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      <KPICard
        title="Total Investido"
        value={loading ? "Carregando..." : `R$ ${kpis.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        change={loading ? "..." : "+12.5%"}
        icon={DollarSign}
        trend="up"
      />
      <KPICard
        title="Receita Total"
        value={loading ? "Carregando..." : `R$ ${kpis.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        change={loading ? "..." : "+18.2%"}
        icon={TrendingUp}
        trend="up"
      />
      <KPICard
        title="Total de Pedidos"
        value={loading ? "Carregando..." : kpis.totalOrders.toLocaleString()}
        change={loading ? "..." : "+15.8%"}
        icon={Target}
        trend="up"
      />
      <KPICard
        title="ROAS"
        value={loading ? "Carregando..." : `${kpis.roas.toFixed(2)}x`}
        change={loading ? "..." : "+0.3x"}
        icon={BarChart3}
        trend="up"
      />
      <KPICard
        title="Taxa de Conversão"
        value={loading ? "Carregando..." : `${kpis.conversionRate.toFixed(1)}%`}
        change={loading ? "..." : "+0.8%"}
        icon={MousePointer}
        trend="up"
      />
      <KPICard
        title="Ticket Médio"
        value={loading ? "Carregando..." : `R$ ${kpis.avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        change={loading ? "..." : "+5.2%"}
        icon={DollarSign}
        trend="up"
      />
    </div>
  );
};
