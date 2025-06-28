
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscriptionRenewalsLineData } from "@/hooks/useSubscriptionRenewalsLineData";
import { TrendingUp } from "lucide-react";

interface SubscriptionRenewalsLineChartProps {
  dateRange: { from: Date; to: Date };
  planFilter: string;
  onPlanFilterChange: (plan: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  availablePlans: string[];
}

export const SubscriptionRenewalsLineChart: React.FC<SubscriptionRenewalsLineChartProps> = ({
  dateRange,
  planFilter,
  onPlanFilterChange,
  statusFilter,
  onStatusFilterChange,
  availablePlans
}) => {
  const { lineData, loading } = useSubscriptionRenewalsLineData(
    dateRange,
    { plan: planFilter, status: statusFilter }
  );

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'quantity') {
      return [value.toString(), 'Quantidade'];
    }
    return [formatCurrency(value), 'Receita'];
  };

  const hasData = lineData.some(item => item.quantity > 0 || item.revenue > 0);

  // Calcular totais para exibição
  const totalMetrics = lineData.reduce((acc, item) => ({
    revenue: acc.revenue + item.revenue,
    quantity: acc.quantity + item.quantity
  }), { revenue: 0, quantity: 0 });

  console.log('📊 Chart rendering state:', { 
    loading, 
    dataLength: lineData.length,
    hasData,
    totalMetrics,
    sampleData: lineData.slice(0, 2)
  });

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Renovações de Assinatura
            </CardTitle>
            <CardDescription className="text-slate-400">
              Evolução diária da quantidade e receita das renovações
            </CardDescription>
            <div className="mt-2 flex flex-wrap gap-4">
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Total:</span>{' '}
                <span className="font-semibold text-violet-400">
                  {formatCurrency(totalMetrics.revenue)}
                </span>
              </div>
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Renovações:</span>{' '}
                <span className="font-semibold text-green-400">
                  {totalMetrics.quantity.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="w-full sm:w-40">
              <Select value={planFilter} onValueChange={onPlanFilterChange}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Filtrar plano" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todos os planos</SelectItem>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-slate-400">Carregando dados...</div>
          </div>
        ) : !hasData ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-400 text-lg mb-2">📊 Nenhuma renovação encontrada</div>
              <div className="text-slate-500 text-sm">
                Não há dados de renovações para o período e filtros selecionados
              </div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => value.toString()}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={formatTooltipValue}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="quantity"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Quantidade"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                name="Receita"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
