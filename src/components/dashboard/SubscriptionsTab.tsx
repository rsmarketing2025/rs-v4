
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionsSummaryCards } from "./subscriptions/SubscriptionsSummaryCards";
import { SubscriptionsChart } from "./subscriptions/SubscriptionsChart";
import { SubscriptionsTable } from "./subscriptions/SubscriptionsTable";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

interface SubscriptionsTabProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({ dateRange }) => {
  const [filters, setFilters] = useState({
    plan: 'all',
    eventType: 'all',
    paymentMethod: 'all'
  });

  return (
    <PermissionWrapper requirePage="subscriptions">
      <div className="space-y-4 md:space-y-6">
        <div className="px-1">
          <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">Análise de Assinaturas</h2>
          <p className="text-gray-400 text-sm md:text-base">
            Métricas detalhadas de assinaturas, churn e receita recorrente
          </p>
        </div>

        <SubscriptionsSummaryCards dateRange={dateRange} filters={filters} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-white text-sm md:text-base">Evolução de Assinaturas</CardTitle>
              <CardDescription className="text-gray-400 text-xs md:text-sm">
                Novos assinantes vs cancelamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <SubscriptionsChart 
                type="timeline" 
                dateRange={dateRange} 
                filters={filters} 
              />
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-white text-sm md:text-base">Distribuição por Plano</CardTitle>
              <CardDescription className="text-gray-400 text-xs md:text-sm">
                Participação de cada plano
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <SubscriptionsChart 
                type="plan-distribution" 
                dateRange={dateRange} 
                filters={filters} 
              />
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-white text-sm md:text-base">MRR por Período</CardTitle>
              <CardDescription className="text-gray-400 text-xs md:text-sm">
                Receita recorrente mensal
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <SubscriptionsChart 
                type="mrr" 
                dateRange={dateRange} 
                filters={filters} 
              />
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-white text-sm md:text-base">Taxa de Churn</CardTitle>
              <CardDescription className="text-gray-400 text-xs md:text-sm">
                Porcentagem de cancelamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <SubscriptionsChart 
                type="churn-rate" 
                dateRange={dateRange} 
                filters={filters} 
              />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-white text-sm md:text-base">Eventos de Assinatura</CardTitle>
            <CardDescription className="text-gray-400 text-xs md:text-sm">
              Lista detalhada de todos os eventos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <SubscriptionsTable dateRange={dateRange} filters={filters} />
          </CardContent>
        </Card>
      </div>
    </PermissionWrapper>
  );
};
