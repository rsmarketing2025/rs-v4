
import React from 'react';
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";

interface TotalMetrics {
  totalSales: number;
  totalRevenue: number;
  avgOrderValue: number;
}

interface SalesSummaryCardsProps {
  totalMetrics: TotalMetrics;
}

export const SalesSummaryCards: React.FC<SalesSummaryCardsProps> = ({
  totalMetrics
}) => {
  // Debug logging to track the values
  console.log('SalesSummaryCards - totalMetrics:', totalMetrics);

  const cards = [
    {
      title: "Total de Vendas",
      value: totalMetrics.totalSales.toLocaleString(),
      change: "+15.6%",
      icon: ShoppingCart,
      variant: 'black' as const
    },
    {
      title: "Receita Total", 
      value: `R$ ${totalMetrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: "+23.8%",
      icon: DollarSign,
      variant: 'orange' as const
    },
    {
      title: "Ticket Médio",
      value: `R$ ${totalMetrics.avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: "-2.1%",
      icon: TrendingUp,
      variant: 'purple' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <MetricsCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          icon={card.icon}
          variant={card.variant}
        />
      ))}
    </div>
  );
};
