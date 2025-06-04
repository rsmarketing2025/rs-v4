
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin } from "lucide-react";

interface Sale {
  country: string;
  status: string;
  gross_value: number;
  state?: string;
}

interface StateSalesChartProps {
  sales: Sale[];
}

interface ChartDataPoint {
  state: string;
  orders: number;
  revenue: number;
}

export const StateSalesChart: React.FC<StateSalesChartProps> = ({ sales }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'revenue' | 'orders'>('revenue');

  console.log('StateSalesChart - Received sales:', sales.length);
  console.log('StateSalesChart - Selected country:', selectedCountry);

  // Obter países únicos
  const uniqueCountries = [...new Set(sales.map(sale => sale.country).filter(Boolean))].sort();

  // Filtrar vendas pelo país selecionado
  const filteredSales = selectedCountry === "all" 
    ? sales 
    : sales.filter(sale => sale.country === selectedCountry);

  console.log('StateSalesChart - Filtered sales:', filteredSales.length);

  // Calcular métricas por estado
  const stateMetrics = filteredSales.reduce((acc, sale) => {
    const state = sale.state || 'Não informado';
    
    if (!acc[state]) {
      acc[state] = { orders: 0, revenue: 0 };
    }
    
    acc[state].orders += 1;
    if (sale.status === 'completed') {
      acc[state].revenue += (sale.gross_value || 0);
    }
    
    return acc;
  }, {} as Record<string, { orders: number; revenue: number }>);

  console.log('StateSalesChart - State metrics:', stateMetrics);

  // Converter para array e ordenar
  const chartData: ChartDataPoint[] = Object.entries(stateMetrics)
    .map(([state, data]) => ({
      state,
      orders: data.orders,
      revenue: data.revenue
    }))
    .sort((a, b) => sortBy === 'revenue' ? b.revenue - a.revenue : b.orders - a.orders);

  console.log('StateSalesChart - Chart data:', chartData);

  // Calcular totais
  const totalMetrics = chartData.reduce((acc, item) => ({
    revenue: acc.revenue + item.revenue,
    orders: acc.orders + item.orders
  }), { revenue: 0, orders: 0 });

  if (sales.length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Vendas por Estado
            </CardTitle>
            <CardDescription className="text-slate-400">
              {selectedCountry === "all" 
                ? "Distribuição de vendas e pedidos por estado (todos os países)"
                : `Distribuição de vendas e pedidos por estado em ${selectedCountry}`
              }
            </CardDescription>
            <div className="mt-2 flex flex-wrap gap-4">
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Total:</span>{' '}
                <span className="font-semibold text-green-400">
                  R$ {totalMetrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Pedidos:</span>{' '}
                <span className="font-semibold text-blue-400">
                  {totalMetrics.orders.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Selecionar país" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">Todos os países</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: 'revenue' | 'orders') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="revenue">Receita</SelectItem>
                <SelectItem value="orders">Pedidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-slate-400 text-center">
              {selectedCountry === "all" 
                ? "Nenhum dado de vendas por estado encontrado."
                : `Nenhum estado encontrado para ${selectedCountry}.`
              }
            </p>
          </div>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="state"
                  stroke="#9ca3af"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (sortBy === 'revenue') {
                      return `R$ ${value.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 0 
                      })}`;
                    }
                    return value.toString();
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'revenue' 
                      ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : value.toLocaleString(),
                    name === 'revenue' ? 'Receita' : 'Pedidos'
                  ]}
                  labelFormatter={(label) => `Estado: ${label}`}
                />
                <Bar 
                  dataKey={sortBy}
                  fill={sortBy === 'revenue' ? '#22c55e' : '#3b82f6'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
