
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

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
  const topAffiliates = affiliates.slice(0, 10).map(affiliate => ({
    name: affiliate.affiliate_name.length > 10 
      ? affiliate.affiliate_name.substring(0, 10) + '...' 
      : affiliate.affiliate_name,
    revenue: affiliate.total_revenue,
    conversion: affiliate.conversion_rate,
    sales: affiliate.total_sales,
  }));

  return (
    <PermissionWrapper requirePage="affiliates">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Top Afiliados - Receita</CardTitle>
          <CardDescription className="text-slate-400">
            Top 10 afiliados com maior receita gerada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topAffiliates}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
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
                formatter={(value: any) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  'Receita'
                ]}
              />
              <Bar dataKey="revenue" fill="#475569" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PermissionWrapper>
  );
};
