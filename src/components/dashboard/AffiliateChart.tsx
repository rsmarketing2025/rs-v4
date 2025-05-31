
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

interface AffiliateData {
  affiliate_id: string;
  affiliate_name: string;
  total_revenue: number;
  total_commission: number;
  conversion_rate: number;
  total_sales: number;
}

interface AffiliateChartProps {
  affiliates: AffiliateData[];
}

export const AffiliateChart: React.FC<AffiliateChartProps> = ({ affiliates }) => {
  // Top 10 affiliates by revenue
  const topAffiliates = affiliates.slice(0, 10).map(affiliate => ({
    name: affiliate.affiliate_name.length > 15 
      ? affiliate.affiliate_name.substring(0, 15) + '...' 
      : affiliate.affiliate_name,
    revenue: affiliate.total_revenue,
    commission: affiliate.total_commission,
    conversion: affiliate.conversion_rate,
    sales: affiliate.total_sales,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Top Afiliados - Receita</CardTitle>
          <CardDescription className="text-slate-400">
            Top 10 afiliados com maior receita gerada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topAffiliates} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                type="number" 
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#94a3b8"
                fontSize={12}
                width={120}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  name === 'revenue' 
                    ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                    : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  name === 'revenue' ? 'Receita' : 'Comissão'
                ]}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="commission" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Performance vs Volume</CardTitle>
          <CardDescription className="text-slate-400">
            Taxa de conversão vs número de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={topAffiliates}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="sales" 
                stroke="#94a3b8"
                fontSize={12}
                name="Vendas"
              />
              <YAxis 
                dataKey="conversion" 
                stroke="#94a3b8"
                fontSize={12}
                name="Conversão (%)"
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  name === 'conversion' ? `${value.toFixed(1)}%` : value,
                  name === 'conversion' ? 'Taxa de Conversão' : 'Vendas'
                ]}
              />
              <Scatter dataKey="conversion" fill="#f59e0b" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
