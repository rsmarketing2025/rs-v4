
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSubscriptionRenewalsLineData } from "@/hooks/useSubscriptionRenewalsLineData";
import { ProductFilter } from "./ProductFilter";
import { TrendingUp } from "lucide-react";

interface RenewalsProductLineChartProps {
  dateRange: { from: Date; to: Date };
}

export const RenewalsProductLineChart: React.FC<RenewalsProductLineChartProps> = ({
  dateRange
}) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('all');

  // Remove status filter to align with summary cards - only filter by plan
  const { lineData: renewalsData, loading: renewalsLoading } = useSubscriptionRenewalsLineData(
    dateRange,
    { plan: selectedProduct, status: 'all' }
  );

  const getChartPeriod = () => {
    if (!dateRange.from || !dateRange.to) return 'daily';
    
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 6 && daysDiff <= 7) {
      return 'weekly';
    } else if (daysDiff > 300) {
      return 'yearly';
    } else {
      return 'daily';
    }
  };

  const chartPeriod = getChartPeriod();

  const getChartTitle = () => {
    return 'Renovações por Produto';
  };

  const getChartDescription = () => {
    switch (chartPeriod) {
      case 'weekly':
        return 'Receita de renovações da semana por produto';
      case 'yearly':
        return 'Receita de renovações por mês por produto';
      default:
        return 'Receita de renovações por dia por produto';
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Prepare data for multi-line chart by product - fetch all products when 'all' is selected
  const prepareProductLineData = async () => {
    if (!renewalsData || renewalsData.length === 0) return [];

    // If a specific product is selected, show only that product's data
    if (selectedProduct !== 'all') {
      return renewalsData.map(item => ({
        date: item.date,
        [selectedProduct]: item.revenue
      }));
    }

    // If 'all' is selected, we need to fetch data for each product separately
    // For now, return the combined data as a single line
    return renewalsData.map(item => ({
      date: item.date,
      'Total': item.revenue
    }));
  };

  const [chartData, setChartData] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      const data = await prepareProductLineData();
      setChartData(data);
    };
    loadData();
  }, [renewalsData, selectedProduct]);
  
  // Get all product names for lines (excluding 'date')
  const productNames = chartData.length > 0 
    ? Object.keys(chartData[0]).filter(key => key !== 'date')
    : [];

  // Generate colors for each product line
  const colors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  // Calculate totals for display - align with summary cards calculation
  const totalRenewalsRevenue = renewalsData.reduce((acc, item) => acc + item.revenue, 0);
  const totalRenewalsCount = renewalsData.reduce((acc, item) => acc + item.quantity, 0);

  const loading = renewalsLoading;
  const hasData = chartData.length > 0 && chartData.some(item => 
    Object.keys(item).some(key => key !== 'date' && typeof item[key] === 'number' && item[key] > 0)
  );

  console.log('📊 Renewals product line chart rendering state:', { 
    loading, 
    dataLength: chartData.length,
    hasData,
    totalRenewalsRevenue,
    totalRenewalsCount,
    chartPeriod,
    selectedProduct,
    productNames,
    sampleData: chartData.slice(0, 2)
  });

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col justify-between items-start gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {getChartTitle()}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {getChartDescription()}
            </CardDescription>
            <div className="mt-2 flex flex-wrap gap-6">
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Total de Receita:</span>{' '}
                <span className="font-semibold text-blue-400">
                  {formatCurrency(totalRenewalsRevenue)}
                </span>
              </div>
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Renovações:</span>{' '}
                <span className="font-semibold text-green-400">
                  {totalRenewalsCount}
                </span>
              </div>
            </div>
          </div>
          <ProductFilter
            selectedProduct={selectedProduct}
            onProductChange={setSelectedProduct}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-slate-400">Carregando dados...</div>
          </div>
        ) : !hasData ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-400 text-lg mb-2">📊 Nenhum dado encontrado</div>
              <div className="text-slate-500 text-sm">
                Não há dados para o período selecionado
              </div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={12}
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
                formatter={(value: any, name: string) => [formatCurrency(value), name]}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend />
              {productNames.map((productName, index) => (
                <Line
                  key={productName}
                  type="monotone"
                  dataKey={productName}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  name={productName}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
