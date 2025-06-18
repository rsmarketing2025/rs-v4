
import React from 'react';
import { TrendingUp, Users, DollarSign, AlertTriangle, XCircle } from "lucide-react";
import { useSubscriptionMetrics } from "@/hooks/useSubscriptionMetrics";
import { MetricsCard } from "@/components/dashboard/MetricsCard";

interface SubscriptionsSummaryCardsProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: {
    plan: string;
    eventType: string;
    paymentMethod: string;
  };
}

export const SubscriptionsSummaryCards: React.FC<SubscriptionsSummaryCardsProps> = ({
  dateRange,
  filters
}) => {
  const { metrics, loading } = useSubscriptionMetrics(dateRange, filters);

  const cards = [
    {
      title: "Assinaturas Ativas",
      value: loading ? "..." : metrics.activeSubscriptions.toLocaleString(),
      change: loading ? "..." : `+${metrics.activeSubscriptionsGrowth.toFixed(1)}%`,
      icon: Users,
      variant: 'info' as const
    },
    {
      title: "Novas Assinaturas",
      value: loading ? "..." : metrics.newSubscriptions.toLocaleString(),
      change: loading ? "..." : `+${metrics.newSubscriptionsGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      variant: 'success' as const
    },
    {
      title: "MRR",
      value: loading ? "..." : `R$ ${metrics.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: loading ? "..." : `+${metrics.mrrGrowth.toFixed(1)}%`,
      icon: DollarSign,
      variant: 'success' as const
    },
    {
      title: "Cancelamento",
      value: loading ? "..." : metrics.cancellations.toLocaleString(),
      change: loading ? "..." : `${metrics.cancellationsGrowth >= 0 ? '+' : ''}${metrics.cancellationsGrowth.toFixed(1)}%`,
      icon: XCircle,
      variant: 'warning' as const
    },
    {
      title: "Taxa de Churn",
      value: loading ? "..." : `${metrics.churnRate.toFixed(1)}%`,
      change: loading ? "..." : `${metrics.churnRateChange >= 0 ? '+' : ''}${metrics.churnRateChange.toFixed(1)}%`,
      icon: AlertTriangle,
      variant: 'warning' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
