
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Análise de Assinaturas</h2>
            <p className="text-slate-400">
              Métricas detalhadas de assinaturas, churn e receita recorrente
            </p>
          </div>
          <SubscriptionFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        <SubscriptionsSummaryCards dateRange={dateRange} filters={filters} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-slate-700">
              Detalhes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Evolução de Assinaturas</CardTitle>
                  <CardDescription className="text-slate-400">
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

              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Distribuição por Plano</CardTitle>
                  <CardDescription className="text-slate-400">
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
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">MRR por Período</CardTitle>
                  <CardDescription className="text-slate-400">
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

              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Taxa de Churn</CardTitle>
                  <CardDescription className="text-slate-400">
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
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Eventos de Assinatura</CardTitle>
                <CardDescription className="text-slate-400">
                  Histórico detalhado de todas as transações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionsTable dateRange={dateRange} filters={filters} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionWrapper>
  );
};
