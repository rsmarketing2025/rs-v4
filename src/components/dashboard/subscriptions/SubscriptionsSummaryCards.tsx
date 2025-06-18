
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, AlertTriangle, XCircle } from "lucide-react";
import { useSubscriptionMetrics } from "@/hooks/useSubscriptionMetrics";

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
      color: "text-blue-400"
    },
    {
      title: "Novas Assinaturas",
      value: loading ? "..." : metrics.newSubscriptions.toLocaleString(),
      change: loading ? "..." : `+${metrics.newSubscriptionsGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-green-400"
    },
    {
      title: "MRR",
      value: loading ? "..." : `R$ ${metrics.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: loading ? "..." : `+${metrics.mrrGrowth.toFixed(1)}%`,
      icon: DollarSign,
      color: "text-emerald-400"
    },
    {
      title: "Cancelamento",
      value: loading ? "..." : metrics.cancellations.toLocaleString(),
      change: loading ? "..." : `${metrics.cancellationsGrowth >= 0 ? '+' : ''}${metrics.cancellationsGrowth.toFixed(1)}%`,
      icon: XCircle,
      color: "text-orange-400"
    },
    {
      title: "Taxa de Churn",
      value: loading ? "..." : `${metrics.churnRate.toFixed(1)}%`,
      change: loading ? "..." : `${metrics.churnRateChange >= 0 ? '+' : ''}${metrics.churnRateChange.toFixed(1)}%`,
      icon: AlertTriangle,
      color: "text-red-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{card.title}</p>
                <p className="text-xl font-bold text-white mt-1">{card.value}</p>
                <p className={`text-xs mt-1 ${
                  card.change.startsWith('+') ? 'text-green-400' : 
                  card.change.startsWith('-') ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {card.change}
                </p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
