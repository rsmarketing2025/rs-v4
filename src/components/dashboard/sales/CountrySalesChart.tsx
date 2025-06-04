
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
}

interface ChartData {
  name: string;
  value: number;
  revenue: number;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

export const CountrySalesChart: React.FC<CountrySalesChartProps> = ({ sales }) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Filtrar vendas concluídas
  const completedSales = sales.filter(sale => sale.status === 'completed');

  // Agrupar por país
  const salesByCountry = completedSales.reduce((acc, sale) => {
    const country = sale.country || 'Não informado';
    if (!acc[country]) {
      acc[country] = { count: 0, revenue: 0 };
    }
    acc[country].count += 1;
    acc[country].revenue += sale.gross_value || 0;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  // Converter para formato do gráfico - países
  const countryData: ChartData[] = Object.entries(salesByCountry)
    .map(([name, data]) => ({
      name,
      value: data.count,
      revenue: data.revenue
    }))
    .sort((a, b) => b.value - a.value);

  // Agrupar por estado quando um país está selecionado
  const getStateData = (country: string): ChartData[] => {
    const countryStates = completedSales
      .filter(sale => sale.country === country)
      .reduce((acc, sale) => {
        const state = sale.state || 'Não informado';
        if (!acc[state]) {
          acc[state] = { count: 0, revenue: 0 };
        }
        acc[state].count += 1;
        acc[state].revenue += sale.gross_value || 0;
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

    return Object.entries(countryStates)
      .map(([name, data]) => ({
        name,
        value: data.count,
        revenue: data.revenue
      }))
      .sort((a, b) => b.value - a.value);
  };

  const currentData = selectedCountry ? getStateData(selectedCountry) : countryData;
  const currentTitle = selectedCountry ? `Vendas por Estado - ${selectedCountry}` : 'Vendas por País';

  const handlePieClick = (data: any) => {
    if (!selectedCountry) {
      // Se não há país selecionado, selecionar o país clicado
      setSelectedCountry(data.name);
    }
    // Se já há um país selecionado, não fazemos drill-down nos estados
  };

  const handleBackClick = () => {
    setSelectedCountry(null);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-blue-400">
            Vendas: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-green-400">
            Receita: <span className="font-medium">R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Não mostrar label para fatias menores que 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            {selectedCountry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-slate-300 hover:text-white hover:bg-slate-700 p-1 h-auto"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {currentTitle}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {selectedCountry 
              ? `Distribuição de vendas por estado em ${selectedCountry}`
              : 'Distribuição de vendas por país'
            }
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {currentData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-slate-400">
            Nenhuma venda encontrada
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
                onClick={handlePieClick}
                style={{ cursor: selectedCountry ? 'default' : 'pointer' }}
              >
                {currentData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    style={{ 
                      filter: !selectedCountry ? 'brightness(1.1)' : 'none',
                      transition: 'filter 0.2s ease'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  color: '#e2e8f0',
                  fontSize: '14px',
                  paddingTop: '20px'
                }}
                formatter={(value, entry) => (
                  <span style={{ color: '#e2e8f0' }}>
                    {value} ({entry.payload?.value} vendas)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {!selectedCountry && currentData.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-slate-400 text-sm">
              Clique em um país para ver a distribuição por estados
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
