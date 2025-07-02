
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useProductSalesChartData } from "@/hooks/useProductSalesChartData";

interface ProductSalesChartProps {
  dateRange: { from: Date; to: Date };
  filters: { product: string; eventType: string; paymentMethod: string; status: string };
}

export const ProductSalesChart: React.FC<ProductSalesChartProps> = ({
  dateRange,
  filters
}) => {
  const { chartData, loading } = useProductSalesChartData(dateRange, true);

  // Prepare product revenue data for pie chart
  const prepareProductData = () => {
    const productRevenue: Record<string, number> = {};
    
    chartData.forEach(item => {
      const product = item.product_name || 'Unknown';
      productRevenue[product] = (productRevenue[product] || 0) + (item.revenue || 0);
    });

    return Object.entries(productRevenue).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Prepare daily revenue data for bar chart
  const prepareDailyData = () => {
    const dailyRevenue: Record<string, number> = {};
    
    chartData.forEach(item => {
      const date = new Date(item.date).toLocaleDateString('pt-BR');
      dailyRevenue[date] = (dailyRevenue[date] || 0) + (item.revenue || 0);
    });

    return Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({
        date,
        revenue
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const productData = prepareProductData();
  const dailyData = prepareDailyData();
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Receita por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-slate-400">Carregando dados...</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Receita Diária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-slate-400">Carregando dados...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Receita por Produto</CardTitle>
          <CardDescription className="text-slate-400">
            Distribuição de receita por produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Receita Diária</CardTitle>
          <CardDescription className="text-slate-400">
            Evolução da receita ao longo do período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="date"
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
              />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
