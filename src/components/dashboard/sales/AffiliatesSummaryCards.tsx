
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp } from "lucide-react";
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
  return (
    <PermissionWrapper chartType="summary_cards" page="affiliates">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Total de Afiliados</p>
                <p className="text-xl font-bold text-white">
                  {totalMetrics.totalAffiliates.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Total Comissões</p>
                <p className="text-xl font-bold text-white">
                  R$ {totalMetrics.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-slate-400">Comissão Média</p>
                <p className="text-xl font-bold text-white">
                  R$ {totalMetrics.avgCommissionPerAffiliate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionWrapper>
  );
};
