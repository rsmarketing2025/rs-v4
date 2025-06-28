
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscriptionRenewalsLineData } from "@/hooks/useSubscriptionRenewalsLineData";

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

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white">Renovações de Assinatura</CardTitle>
            <CardDescription className="text-slate-400">
              Evolução diária da quantidade e receita das renovações
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="w-40">
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
            <div className="w-40">
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
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineData}>
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
                formatter={(value: any, name: string) => [
                  name === 'quantity' ? value.toString() : formatCurrency(value),
                  name === 'quantity' ? 'Quantidade' : 'Receita'
                ]}
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
