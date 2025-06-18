
import React from 'react';
import { DollarSign, TrendingUp } from "lucide-react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";

interface CreativesMetricsCardsProps {
  totalSpent: number;
  avgROI: number;
  loading?: boolean;
}

export const CreativesMetricsCards: React.FC<CreativesMetricsCardsProps> = ({
  totalSpent,
  avgROI,
  loading = false
}) => {
  const formatCurrency = (value: number) => 
    `R$ ${(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const formatROI = (value: number) => `${(value || 0).toFixed(2)}x`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <MetricsCard
        title="Total Investido"
        value={loading ? "Carregando..." : formatCurrency(totalSpent)}
        change="+12.5%"
        icon={DollarSign}
        variant="info"
      />
      <MetricsCard
        title="ROI Médio"
        value={loading ? "Carregando..." : formatROI(avgROI)}
        change="+8.3%"
        icon={TrendingUp}
        variant="success"
      />
    </div>
  );
};
