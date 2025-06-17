
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PermissionWrapper } from "@/components/common/PermissionWrapper";
import { useCreativesSalesRanking } from "@/hooks/useCreativesSalesRanking";

interface CreativesSalesChartProps {
  dateRange: { from: Date; to: Date };
}

export const CreativesSalesChart: React.FC<CreativesSalesChartProps> = ({ dateRange }) => {
  const { rankingData, loading } = useCreativesSalesRanking(dateRange);

  // Take top 5 creatives by revenue
  const topCreatives = rankingData
    .slice(0, 5)
    .map(creative => ({
      name: creative.creative_name.length > 15 
        ? creative.creative_name.substring(0, 15) + '...' 
        : creative.creative_name,
      sales: creative.total_sales,
      revenue: creative.total_revenue,
    }));

  if (loading) {
    return (
      <PermissionWrapper requirePage="sales">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">TOP 5 - Maior Receita</CardTitle>
            <CardDescription className="text-gray-400">
              Carregando...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-gray-400">Carregando dados...</div>
            </div>
          </CardContent>
        </Card>
      </PermissionWrapper>
    );
  }

  return (
    <PermissionWrapper requirePage="sales">
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white">TOP 5 - Maior Receita</CardTitle>
          <CardDescription className="text-gray-400">
            Top 5 criativos com maior receita líquida no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topCreatives}>
              <CartesianGrid strokeDasharray="3 3" stroke="#525252" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#262626', 
                  border: '1px solid #525252',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  name === 'sales' ? value.toLocaleString('pt-BR') : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  name === 'sales' ? 'Vendas' : 'Receita Líquida'
                ]}
              />
              <Bar dataKey="sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PermissionWrapper>
  );
};
