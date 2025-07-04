
import React from 'react';
import { TrendingUp, Users, DollarSign, XCircle } from "lucide-react";
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

  // Debug log for the component
  console.log('🎯 [SUMMARY CARDS] Rendering with metrics:', {
    loading,
    cancellations: metrics.cancellations,
    allMetrics: metrics
  });

  const cards = [
    {
      title: "Assinaturas Ativas",
      value: loading ? "..." : metrics.activeSubscriptions.toLocaleString(),
      change: loading ? "..." : `+${metrics.activeSubscriptionsGrowth.toFixed(1)}%`,
      icon: Users,
      variant: 'purple' as const
    },
    {
      title: "Novas Assinaturas",
      value: loading ? "..." : metrics.newSubscriptions.toLocaleString(),
      change: loading ? "..." : `+${metrics.newSubscriptionsGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      variant: 'success' as const // Verde
    },
    {
      title: "MRR",
      value: loading ? "..." : `R$ ${metrics.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: loading ? "..." : `+${metrics.mrrGrowth.toFixed(1)}%`,
      icon: DollarSign,
      variant: 'black' as const
    },
    {
      title: "Cancelamento",
      value: loading ? "..." : metrics.cancellations.toLocaleString(),
      change: loading ? "..." : `${metrics.cancellationsGrowth >= 0 ? '+' : ''}${metrics.cancellationsGrowth.toFixed(1)}%`,
      icon: XCircle,
      variant: 'warning' as const // Vermelho/laranja
    }
  ];

  // Debug specific cancellation card
  const cancellationCard = cards.find(card => card.title === "Cancelamento");
  console.log('🎯 [SUMMARY CARDS] Cancelamento card data:', cancellationCard);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
