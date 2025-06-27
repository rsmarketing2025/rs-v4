
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesData {
  month: string;
  sales: number;
  revenue: number;
}

interface SalesChartProps {
  salesData: SalesData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ salesData }) => {
  return (
    <Card className="bg-blue-800 border-blue-700">
      <CardHeader>
        <CardTitle className="text-white">Vendas Mensais</CardTitle>
        <CardDescription className="text-blue-200">
          Evolução das vendas ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" />
            <XAxis 
              dataKey="month" 
              stroke="#93c5fd"
              fontSize={12}
            />
            <YAxis 
              stroke="#93c5fd"
              fontSize={12}
              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e3a8a', 
                border: '1px solid #1e40af',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: any) => [
                `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                'Vendas'
              ]}
            />
            <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
