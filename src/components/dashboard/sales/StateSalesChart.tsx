
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin } from "lucide-react";

interface Sale {
  id: string;
  gross_value: number;
  status: string;
  state: string;
  country: string;
}

interface StateSalesChartProps {
  sales: Sale[];
}

export const StateSalesChart: React.FC<StateSalesChartProps> = ({ sales }) => {
  // Filter only completed sales for the chart
  const completedSales = sales.filter(sale => sale.status === 'completed');

  // Prepare state revenue data from completed sales only
  const stateRevenue = completedSales.reduce((acc, sale) => {
    const state = sale.state || 'Não informado';
    acc[state] = (acc[state] || 0) + (sale.gross_value || 0);
    return acc;
  }, {} as Record<string, number>);

  const stateData = Object.entries(stateRevenue)
    .map(([state, revenue]) => ({ state, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10); // Top 10 states

  // Calculate total revenue and orders from completed sales
  const totalRevenue = completedSales.reduce((acc, sale) => acc + (sale.gross_value || 0), 0);
  const totalOrders = completedSales.length;

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Vendas por Região (Apenas Aprovadas)
        </CardTitle>
        <CardDescription className="text-slate-400">
          Distribuição de vendas aprovadas e pedidos por estado/região
        </CardDescription>
        <div className="flex gap-4 text-sm">
          <span className="text-green-400">
            Total: R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-blue-400">
            Pedidos: {totalOrders}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis 
              dataKey="state" 
              stroke="#94a3b8"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
            />
            <Bar 
              dataKey="revenue" 
              fill="#22c55e" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        {stateData.length === 0 && (
          <div className="flex items-center justify-center h-80">
            <p className="text-slate-400 text-center">
              Nenhuma venda aprovada encontrada para o período selecionado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
