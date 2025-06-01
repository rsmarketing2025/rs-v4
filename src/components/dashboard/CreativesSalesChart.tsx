
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Sale {
  id: string;
  creative_name: string;
  gross_value: number;
  status: string;
}

interface CreativesSalesChartProps {
  sales: Sale[];
}

export const CreativesSalesChart: React.FC<CreativesSalesChartProps> = ({ sales }) => {
  // Group sales by creative and calculate total revenue for completed sales
  const creativeSales = sales
    .filter(sale => sale.status === 'completed')
    .reduce((acc, sale) => {
      const creativeName = sale.creative_name;
      if (!acc[creativeName]) {
        acc[creativeName] = {
          name: creativeName.length > 20 ? creativeName.substring(0, 20) + '...' : creativeName,
          fullName: creativeName,
          revenue: 0,
          count: 0
        };
      }
      acc[creativeName].revenue += sale.gross_value || 0;
      acc[creativeName].count += 1;
      return acc;
    }, {} as Record<string, { name: string; fullName: string; revenue: number; count: number }>);

  // Convert to array and sort by revenue
  const chartData = Object.values(creativeSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20); // Show top 20 creatives

  // Calculate minimum width based on number of items
  const minWidth = Math.max(800, chartData.length * 60);

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Vendas por Criativo</CardTitle>
        <CardDescription className="text-slate-400">
          Top 20 criativos com maior receita (apenas vendas concluídas)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div style={{ minWidth: `${minWidth}px` }}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
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
                  formatter={(value: any, name: string, props: any) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    'Receita'
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
