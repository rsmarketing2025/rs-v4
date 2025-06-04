
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, ChevronDown, X } from "lucide-react";

interface Sale {
  country: string;
  status: string;
  gross_value: number;
  state?: string;
}

interface CountrySalesChartProps {
  sales: Sale[];
  countryFilter: string;
}

interface ChartDataPoint {
  country?: string;
  state?: string;
  orders: number;
  revenue: number;
}

export const CountrySalesChart: React.FC<CountrySalesChartProps> = ({ sales, countryFilter }) => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'revenue' | 'orders'>('revenue');

  // Determinar se devemos mostrar estados ou países
  const showingStates = countryFilter !== "all";
  
  console.log('CountrySalesChart - Received countryFilter:', countryFilter);
  console.log('CountrySalesChart - showingStates:', showingStates);
  
  // Filtrar vendas por país se um país específico estiver selecionado
  const countryFilteredSales = showingStates 
    ? sales.filter(sale => sale.country === countryFilter)
    : sales;

  console.log('CountrySalesChart - Total sales:', sales.length);
  console.log('CountrySalesChart - Filtered sales:', countryFilteredSales.length);
  console.log('CountrySalesChart - Sample states from filtered data:', countryFilteredSales.slice(0, 3).map(s => s.state));

  // Calcular métricas por país ou estado
  const metrics = countryFilteredSales.reduce((acc, sale) => {
    const key = showingStates ? (sale.state || 'Não informado') : (sale.country || 'Não informado');
    
    if (!acc[key]) {
      acc[key] = { orders: 0, revenue: 0 };
    }
    
    acc[key].orders += 1;
    if (sale.status === 'completed') {
      acc[key].revenue += (sale.gross_value || 0);
    }
    
    return acc;
  }, {} as Record<string, { orders: number; revenue: number }>);

  console.log('CountrySalesChart - Calculated metrics:', metrics);

  // Converter para array e ordenar
  const chartDataPoints: ChartDataPoint[] = Object.entries(metrics)
    .map(([key, data]) => ({
      ...(showingStates ? { state: key } : { country: key }),
      orders: data.orders,
      revenue: data.revenue
    }))
    .sort((a, b) => sortBy === 'revenue' ? b.revenue - a.revenue : b.orders - a.orders);

  console.log('CountrySalesChart - Chart data points:', chartDataPoints);

  // Preparar dados do gráfico
  let chartData: ChartDataPoint[];
  if (showingStates) {
    // Mostrar todos os estados quando um país está selecionado
    chartData = chartDataPoints;
  } else {
    // Para países: usar seleção múltipla
    const availableCountries = chartDataPoints
      .map(item => item.country)
      .filter((country): country is string => typeof country === 'string');
    
    // Inicializar com top 5 países se nenhum estiver selecionado
    React.useEffect(() => {
      if (selectedCountries.length === 0 && chartDataPoints.length > 0) {
        const topCountries = chartDataPoints
          .slice(0, 5)
          .map(item => item.country)
          .filter((country): country is string => typeof country === 'string');
        setSelectedCountries(topCountries);
      }
    }, [chartDataPoints.length]);

    chartData = chartDataPoints.filter(item => item.country && selectedCountries.includes(item.country));
  }

  console.log('CountrySalesChart - Final chart data:', chartData);

  const handleCountryToggle = (country: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(country)) {
        return prev.filter(c => c !== country);
      } else {
        return [...prev, country];
      }
    });
  };

  const handleSelectAll = () => {
    const availableCountries = chartDataPoints
      .map(item => item.country)
      .filter((country): country is string => typeof country === 'string');
    setSelectedCountries(availableCountries);
  };

  const handleClearAll = () => {
    setSelectedCountries([]);
  };

  const removeCountry = (country: string) => {
    setSelectedCountries(prev => prev.filter(c => c !== country));
  };

  if (sales.length === 0) {
    return null;
  }

  // Calcular totais para exibição
  const totalMetrics = chartData.reduce((acc, item) => ({
    revenue: acc.revenue + item.revenue,
    orders: acc.orders + item.orders
  }), { revenue: 0, orders: 0 });

  const availableCountries = showingStates ? [] : chartDataPoints
    .map(item => item.country)
    .filter((country): country is string => typeof country === 'string');

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {showingStates ? `Vendas por Estado - ${countryFilter}` : 'Vendas por País'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {showingStates 
                ? `Distribuição de vendas e pedidos por estado em ${countryFilter}`
                : 'Distribuição de vendas e pedidos por país'
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
            <Select value={sortBy} onValueChange={(value: 'revenue' | 'orders') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="revenue">Receita</SelectItem>
                <SelectItem value="orders">Pedidos</SelectItem>
              </SelectContent>
            </Select>

            {!showingStates && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-[200px] justify-between bg-slate-900/50 border-slate-600 text-white hover:bg-slate-800/50"
                  >
                    <span>
                      {selectedCountries.length === 0 
                        ? "Selecionar países"
                        : `${selectedCountries.length} país${selectedCountries.length !== 1 ? 'es' : ''} selecionado${selectedCountries.length !== 1 ? 's' : ''}`
                      }
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-slate-900 border-slate-700" align="end">
                  <div className="p-3 border-b border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white text-sm font-medium">Selecionar Países</h4>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleSelectAll}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Todos
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleClearAll}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-3 space-y-2">
                      {availableCountries.map((country) => (
                        <div key={country} className="flex items-center space-x-2">
                          <Checkbox
                            id={country}
                            checked={selectedCountries.includes(country)}
                            onCheckedChange={() => handleCountryToggle(country)}
                            className="border-slate-500"
                          />
                          <label
                            htmlFor={country}
                            className="text-sm text-slate-300 cursor-pointer flex-1"
                          >
                            {country}
                          </label>
                          <div className="text-xs text-slate-400">
                            {metrics[country]?.orders || 0} pedidos
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Países selecionados - apenas mostrar quando não estiver mostrando estados */}
        {!showingStates && selectedCountries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedCountries.map((country) => (
              <Badge 
                key={country} 
                variant="secondary" 
                className="bg-slate-700 text-slate-300 hover:bg-slate-600"
              >
                {country}
                <button
                  onClick={() => removeCountry(country)}
                  className="ml-1 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[500px]">
            <p className="text-slate-400 text-center">
              {showingStates 
                ? `Nenhum estado encontrado para ${countryFilter}.`
                : "Selecione pelo menos um país para visualizar o gráfico."
              }
            </p>
          </div>
        ) : (
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey={showingStates ? "state" : "country"}
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
                  labelFormatter={(label) => `${showingStates ? 'Estado' : 'País'}: ${label}`}
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
