
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

interface CreativeData {
  creative_name: string;
  amount_spent: number;
  sales_count: number;
  roi: number;
  cpa: number;
  profit: number;
  gross_sales: number;
  views_3s: number;
  ctr: number;
  conv_body_rate: number;
}

interface TopTenChartProps {
  creatives: CreativeData[];
}

export const TopTenChart: React.FC<TopTenChartProps> = ({ creatives }) => {
  const filteredData = creatives
    .filter(creative => creative.gross_sales > 0)
    .sort((a, b) => b.gross_sales - a.gross_sales)
    .slice(0, 10)
    .map(creative => ({
      name: creative.creative_name.length > 20 
        ? creative.creative_name.substring(0, 20) + '...' 
        : creative.creative_name,
      fullName: creative.creative_name,
      value: creative.gross_sales
    }));

  const formatValue = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <PermissionWrapper requirePage="creatives">
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-xl">TOP 10 Criativos por Receita</CardTitle>
          <CardDescription className="text-slate-400">
            Ranking dos criativos com maior receita de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={formatValue}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={12}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => [
                    formatValue(value),
                    'Receita de Vendas'
                  ]}
                  labelFormatter={(label: any, payload: any) => 
                    payload?.[0]?.payload?.fullName || label
                  }
                />
                <Bar 
                  dataKey="value" 
                  fill="#22c55e"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </PermissionWrapper>
  );
};
