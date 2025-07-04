import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNewSubscriptionsLineData } from "@/hooks/useNewSubscriptionsLineData";
import { ProductFilter } from "./ProductFilter";
import { TrendingUp } from "lucide-react";

interface NewSubscriptionsLineChartProps {
  dateRange: { from: Date; to: Date };
}

export const NewSubscriptionsLineChart: React.FC<NewSubscriptionsLineChartProps> = ({
  dateRange
}) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('all');

  const { lineData: subscriptionsData, loading: subscriptionsLoading, totalSubscriptions } = useNewSubscriptionsLineData(
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
    return 'Novas Assinaturas por Produto';
  };

  const getChartDescription = () => {
    switch (chartPeriod) {
      case 'weekly':
        return 'Receita de novas assinaturas da semana por produto';
      case 'yearly':
        return 'Receita de novas assinaturas por mês por produto';
      default:
        return 'Receita de novas assinaturas por dia por produto';
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatTooltipValue = (value: any, name: string) => {
    return [formatCurrency(value), name];
  };

  const loading = subscriptionsLoading;
  const hasData = subscriptionsData.length > 0 && subscriptionsData.some(item => 
    Object.keys(item).some(key => key !== 'date' && typeof item[key] === 'number' && item[key] > 0)
  );

  // Calculate totals for display with improved precision
  const totalNewSubscriptionsRevenue = subscriptionsData.reduce((acc, item) => {
    return acc + Object.keys(item).reduce((sum, key) => {
      if (key !== 'date' && typeof item[key] === 'number') {
        return sum + (item[key] as number);
      }
      return sum;
    }, 0);
  }, 0);

  // Get all product names for lines (excluding 'date')
  const productNames = subscriptionsData.length > 0 
    ? Object.keys(subscriptionsData[0]).filter(key => key !== 'date')
    : [];

  // Generate colors for each product line
  const colors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  console.log('📊 New subscriptions chart rendering state:', { 
    loading, 
    dataLength: subscriptionsData.length,
    hasData,
    totalNewSubscriptionsRevenue,
    totalSubscriptions,
    chartPeriod,
    selectedProduct,
    productNames,
    sampleData: subscriptionsData.slice(0, 2)
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
                <span className="font-semibold text-green-400">
                  {formatCurrency(totalNewSubscriptionsRevenue)}
                </span>
              </div>
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Novas Assinaturas:</span>{' '}
                <span className="font-semibold text-blue-400">
                  {totalSubscriptions}
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
            <LineChart data={subscriptionsData}>
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
                formatter={formatTooltipValue}
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
