
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Eye, Target, BarChart3 } from "lucide-react";

interface TotalMetrics {
  spent: number;
  views: number;
  sales: number;
  revenue: number;
}

interface CreativesSummaryCardsProps {
  totalMetrics: TotalMetrics;
  avgROI: number;
}

export const CreativesSummaryCards: React.FC<CreativesSummaryCardsProps> = ({
  totalMetrics,
  avgROI
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-slate-400">Total Investido</p>
              <p className="text-xl font-bold text-white">
                R$ {totalMetrics.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-slate-400">Total Views 3s</p>
              <p className="text-xl font-bold text-white">
                {totalMetrics.views.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm text-slate-400">Total Vendas</p>
              <p className="text-xl font-bold text-white">
                {totalMetrics.sales.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-sm text-slate-400">ROI Médio</p>
              <p className="text-xl font-bold text-white">
                {avgROI.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
