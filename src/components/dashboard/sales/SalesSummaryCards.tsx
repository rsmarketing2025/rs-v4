
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, RefreshCw, CreditCard } from "lucide-react";

interface SalesSummaryCardsProps {
  totalMetrics: {
    revenue: number;
    orders: number;
    refundedValue: number;
    chargebackValue: number;
  };
}

export const SalesSummaryCards: React.FC<SalesSummaryCardsProps> = ({ totalMetrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-slate-400">Receita Total</p>
              <p className="text-xl font-bold text-white">
                R$ {totalMetrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-slate-400">Total de Pedidos Aprovados</p>
              <p className="text-xl font-bold text-white">
                {totalMetrics.orders.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm text-slate-400">Valor Reembolsado</p>
              <p className="text-xl font-bold text-white">
                R$ {totalMetrics.refundedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-sm text-slate-400">Total de Chargeback</p>
              <p className="text-xl font-bold text-white">
                R$ {totalMetrics.chargebackValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
