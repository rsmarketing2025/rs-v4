
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { useSubscriptionRenewalMetrics } from "@/hooks/useSubscriptionRenewalMetrics";

interface SubscriptionRenewalsSummaryCardsProps {
  dateRange: { from: Date; to: Date };
  filters: { plan: string; eventType: string; paymentMethod: string };
}

export const SubscriptionRenewalsSummaryCards: React.FC<SubscriptionRenewalsSummaryCardsProps> = ({
  dateRange,
  filters
}) => {
  const { metrics, loading } = useSubscriptionRenewalMetrics(dateRange, filters);

  const cards = [
    {
      title: "Total de Renovações",
      value: loading ? "..." : metrics.totalRenewals.toLocaleString('pt-BR'),
      change: loading ? 0 : metrics.renewalGrowth,
      icon: RefreshCw,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Receita de Renovações",
      value: loading ? "..." : `R$ ${metrics.totalRenewalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: loading ? 0 : metrics.revenueGrowth,
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Valor Médio por Renovação",
      value: loading ? "..." : `R$ ${metrics.averageRenewalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: loading ? 0 : 5.2,
      icon: BarChart3,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Planos Mais Renovados",
      value: loading ? "..." : Object.keys(metrics.renewalsByPlan).length.toString(),
      change: loading ? 0 : 2.1,
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;
        
        return (
          <Card key={index} className="bg-slate-800/30 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                {card.title}
              </CardTitle>
              <div className={`h-10 w-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {card.value}
              </div>
              <div className="flex items-center text-xs">
                <span className={`inline-flex items-center ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isPositive ? '+' : ''}{card.change.toFixed(1)}%
                </span>
                <span className="text-slate-400 ml-1">
                  vs período anterior
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
