import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionsSummaryCards } from "./subscriptions/SubscriptionsSummaryCards";
import { SubscriptionsChart } from "./subscriptions/SubscriptionsChart";
import { SubscriptionsTable } from "./subscriptions/SubscriptionsTable";
import { SubscriptionFilters } from "./subscriptions/SubscriptionFilters";
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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Análise de Assinaturas</h2>
          <p className="text-gray-400">
            Métricas detalhadas de assinaturas, churn e receita recorrente
          </p>
        </div>

        <SubscriptionsSummaryCards dateRange={dateRange} filters={filters} />

        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="pt-6">
            <SubscriptionFilters filters={filters} onFiltersChange={setFilters} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Evolução de Assinaturas</CardTitle>
              <CardDescription className="text-gray-400">
                Novos assinantes vs cancelamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionsChart 
                type="timeline" 
                dateRange={dateRange} 
                filters={filters} 
              />
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Distribuição por Plano</CardTitle>
              <CardDescription className="text-gray-400">
                Participação de cada plano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionsChart 
                type="plan-distribution" 
                dateRange={dateRange} 
                filters={filters} 
              />
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">MRR por Período</CardTitle>
              <CardDescription className="text-gray-400">
                Receita recorrente mensal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionsChart 
                type="mrr" 
                dateRange={dateRange} 
                filters={filters} 
              />
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Taxa de Churn</CardTitle>
              <CardDescription className="text-gray-400">
                Porcentagem de cancelamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionsChart 
                type="churn-rate" 
                dateRange={dateRange} 
                filters={filters} 
              />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Eventos de Assinatura</CardTitle>
            <CardDescription className="text-gray-400">
              Lista detalhada de todos os eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionsTable dateRange={dateRange} filters={filters} />
          </CardContent>
        </Card>
      </div>
    </PermissionWrapper>
  );
};
