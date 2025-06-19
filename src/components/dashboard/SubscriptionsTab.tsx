
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionsSummaryCards } from "./subscriptions/SubscriptionsSummaryCards";
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

        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-3 md:p-6">
            <SubscriptionsTable dateRange={dateRange} filters={filters} />
          </CardContent>
        </Card>
      </div>
    </PermissionWrapper>
  );
};
