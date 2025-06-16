
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

interface TotalMetrics {
  totalSales: number;
  totalRevenue: number;
  avgOrderValue: number;
}

interface SalesSummaryCardsProps {
  totalMetrics: TotalMetrics;
}

export const SalesSummaryCards: React.FC<SalesSummaryCardsProps> = ({
  totalMetrics
}) => {
  // Debug logging to track the values
  console.log('SalesSummaryCards - totalMetrics:', totalMetrics);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-neutral-800 border-neutral-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Total de Vendas</p>
              <p className="text-xl font-bold text-white">
                {totalMetrics.totalSales.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-neutral-800 border-neutral-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Receita Total</p>
              <p className="text-xl font-bold text-white">
                R$ {totalMetrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-neutral-800 border-neutral-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Ticket Médio</p>
              <p className="text-xl font-bold text-white">
                R$ {totalMetrics.avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
