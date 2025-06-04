
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Sale {
  id: string;
  order_id: string;
  creative_name: string;
  status: string;
  payment_method: string;
  gross_value: number;
  net_value: number;
  customer_name: string;
  customer_email: string;
  affiliate_name: string;
  is_affiliate: boolean;
  affiliate_commission: number;
  sale_date: string;
  country: string;
  state: string;
}

interface CountrySalesChartProps {
  sales: Sale[];
  countryFilter: string;
}

interface ChartData {
  name: string;
  vendas: number;
  receita: number;
}

export const CountrySalesChart: React.FC<CountrySalesChartProps> = ({ sales, countryFilter }) => {
  // Filtrar vendas concluídas
  const completedSales = sales.filter(sale => sale.status === 'completed');

  let chartData: ChartData[] = [];
  let chartTitle = '';
  let chartDescription = '';

  if (countryFilter !== 'all') {
    // Mostrar estados do país selecionado
    const statesSales = completedSales
      .filter(sale => sale.country === countryFilter)
      .reduce((acc, sale) => {
        const state = sale.state || 'Não informado';
        if (!acc[state]) {
          acc[state] = { count: 0, revenue: 0 };
        }
        acc[state].count += 1;
        acc[state].revenue += sale.gross_value || 0;
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

    chartData = Object.entries(statesSales)
      .map(([name, data]) => ({
        name,
        vendas: data.count,
        receita: data.revenue
      }))
      .sort((a, b) => b.vendas - a.vendas);

    chartTitle = `Vendas por Estado - ${countryFilter}`;
    chartDescription = `Distribuição de vendas por estado em ${countryFilter}`;
  } else {
    // Mostrar países quando nenhum país específico for selecionado
    const salesByCountry = completedSales.reduce((acc, sale) => {
      const country = sale.country || 'Não informado';
      if (!acc[country]) {
        acc[country] = { count: 0, revenue: 0 };
      }
      acc[country].count += 1;
      acc[country].revenue += sale.gross_value || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    chartData = Object.entries(salesByCountry)
      .map(([name, data]) => ({
        name,
        vendas: data.count,
        receita: data.revenue
      }))
      .sort((a, b) => b.vendas - a.vendas);

    chartTitle = 'Vendas por País';
    chartDescription = 'Distribuição de vendas por país';
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-400">
            Vendas: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-green-400">
            Receita: <span className="font-medium">R$ {payload[1].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{chartTitle}</CardTitle>
        <CardDescription className="text-slate-400">
          {chartDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-slate-400">
            {countryFilter !== 'all' ? `Nenhuma venda encontrada para ${countryFilter}` : 'Nenhuma venda encontrada'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="vendas" 
                fill="#3B82F6" 
                name="Vendas"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="receita" 
                fill="#10B981" 
                name="Receita (R$)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
