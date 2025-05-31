
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Creative {
  id: string;
  creative_name: string;
  amount_spent: number;
  clicks: number;
  ctr: number;
  hook_rate: number;
}

interface CreativePerformanceChartProps {
  creatives: Creative[];
}

export const CreativePerformanceChart: React.FC<CreativePerformanceChartProps> = ({ creatives }) => {
  // Prepare data for chart - top 10 creatives by spend
  const chartData = creatives
    .sort((a, b) => (b.amount_spent || 0) - (a.amount_spent || 0))
    .slice(0, 10)
    .map(creative => ({
      name: creative.creative_name.length > 20 
        ? creative.creative_name.substring(0, 20) + '...' 
        : creative.creative_name,
      spent: creative.amount_spent || 0,
      clicks: creative.clicks || 0,
      ctr: creative.ctr || 0,
      hookRate: creative.hook_rate || 0,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Gasto por Criativo</CardTitle>
          <CardDescription className="text-slate-400">
            Top 10 criativos com maior investimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Gasto']}
              />
              <Bar dataKey="spent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Hook Rate vs CTR</CardTitle>
          <CardDescription className="text-slate-400">
            Comparação de performance dos criativos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  `${value.toFixed(2)}%`, 
                  name === 'hookRate' ? 'Hook Rate' : 'CTR'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="hookRate" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="ctr" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
