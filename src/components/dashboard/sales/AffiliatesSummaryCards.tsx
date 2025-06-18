
import React from 'react';
import { Users, DollarSign, TrendingUp } from "lucide-react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

interface TotalMetrics {
  totalAffiliates: number;
  totalCommissions: number;
  avgCommissionPerAffiliate: number;
}

interface AffiliatesSummaryCardsProps {
  totalMetrics: TotalMetrics;
}

export const AffiliatesSummaryCards: React.FC<AffiliatesSummaryCardsProps> = ({
  totalMetrics
}) => {
  const cards = [
    {
      title: "Total de Afiliados",
      value: totalMetrics.totalAffiliates.toLocaleString(),
      change: "+8.2%",
      icon: Users,
      variant: 'purple' as const
    },
    {
      title: "Total Comissões",
      value: `R$ ${totalMetrics.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: "+12.5%",
      icon: DollarSign,
      variant: 'orange' as const
    },
    {
      title: "Comissão Média",
      value: `R$ ${totalMetrics.avgCommissionPerAffiliate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: "+3.1%",
      icon: TrendingUp,
      variant: 'success' as const
    }
  ];

  return (
    <PermissionWrapper requirePage="affiliates">
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
    </PermissionWrapper>
  );
};
