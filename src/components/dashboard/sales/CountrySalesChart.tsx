
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, ChevronDown, X, ArrowLeft } from "lucide-react";

interface Sale {
  country: string;
  status: string;
  gross_value: number;
  state?: string;
}

interface CountrySalesChartProps {
  sales: Sale[];
}

export const CountrySalesChart: React.FC<CountrySalesChartProps> = ({ sales }) => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'revenue' | 'orders'>('revenue');
  const [drillDownMode, setDrillDownMode] = useState(false);

  // Calcular métricas por país
  const countryMetrics = sales.reduce((acc, sale) => {
    const country = sale.country || 'Não informado';
    
    if (!acc[country]) {
      acc[country] = { orders: 0, revenue: 0, states: {} };
    }
    
    acc[country].orders += 1;
    if (sale.status === 'completed') {
      acc[country].revenue += (sale.gross_value || 0);
    }

    // Calcular métricas por estado dentro do país
    const state = sale.state || 'Não informado';
    if (!acc[country].states[state]) {
      acc[country].states[state] = { orders: 0, revenue: 0 };
    }
    acc[country].states[state].orders += 1;
    if (sale.status === 'completed') {
      acc[country].states[state].revenue += (sale.gross_value || 0);
    }
    
    return acc;
  }, {} as Record<string, { orders: number; revenue: number; states: Record<string, { orders: number; revenue: number }> }>);

  // Converter para array e ordenar (países)
  const countriesData = Object.entries(countryMetrics)
    .map(([country, data]) => ({
      country,
      orders: data.orders,
      revenue: data.revenue
    }))
    .sort((a, b) => sortBy === 'revenue' ? b.revenue - a.revenue : b.orders - a.orders);

  // Dados dos estados para os países selecionados
  const statesData = selectedCountries.length > 0 
    ? selectedCountries.flatMap(country => {
        const countryData = countryMetrics[country];
        if (!countryData) return [];
        
        return Object.entries(countryData.states).map(([state, data]) => ({
          state: `${state} (${country})`,
          orders: data.orders,
          revenue: data.revenue,
          country: country
        }));
      }).sort((a, b) => sortBy === 'revenue' ? b.revenue - a.revenue : b.orders - a.orders)
    : [];

  // Países únicos para seleção
  const availableCountries = countriesData.map(item => item.country);

  // Inicializar com top 5 países se nenhum estiver selecionado
  React.useEffect(() => {
    if (selectedCountries.length === 0 && countriesData.length > 0) {
      setSelectedCountries(countriesData.slice(0, 5).map(item => item.country));
    }
  }, [countriesData]);

  // Dados para o gráfico
  const chartData = drillDownMode 
    ? statesData 
    : countriesData.filter(item => selectedCountries.includes(item.country));

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
    setSelectedCountries(availableCountries);
  };

  const handleClearAll = () => {
    setSelectedCountries([]);
  };

  const removeCountry = (country: string) => {
    setSelectedCountries(prev => prev.filter(c => c !== country));
  };

  const handleBarClick = (data: any) => {
    if (!drillDownMode && data.country && selectedCountries.includes(data.country)) {
      setDrillDownMode(true);
    }
  };

  const handleBackToCountries = () => {
    setDrillDownMode(false);
  };

  if (sales.length === 0) {
    return null;
  }

  const totalSelectedMetrics = selectedCountries.reduce((total, country) => {
    const countryData = countryMetrics[country];
    if (countryData) {
      total.orders += countryData.orders;
      total.revenue += countryData.revenue;
    }
    return total;
  }, { orders: 0, revenue: 0 });

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {drillDownMode ? `Vendas por Estado - Países Selecionados` : 'Vendas por País'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {drillDownMode 
                ? `Estados dos países selecionados: ${selectedCountries.join(', ')}`
                : 'Distribuição de vendas e pedidos por país'
              }
            </CardDescription>
            {selectedCountries.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-4">
                <div className="text-sm text-slate-300">
                  <span className="text-slate-400">Total Selecionado:</span>{' '}
                  <span className="font-semibold text-green-400">
                    R$ {totalSelectedMetrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-sm text-slate-300">
                  <span className="text-slate-400">Pedidos:</span>{' '}
                  <span className="font-semibold text-blue-400">
                    {totalSelectedMetrics.orders.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {drillDownMode && (
              <Button 
                variant="outline" 
                onClick={handleBackToCountries}
                className="bg-slate-900/50 border-slate-600 text-white hover:bg-slate-800/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Países
              </Button>
            )}

            <Select value={sortBy} onValueChange={(value: 'revenue' | 'orders') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="revenue">Receita</SelectItem>
                <SelectItem value="orders">Pedidos</SelectItem>
              </SelectContent>
            </Select>

            {!drillDownMode && (
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
                            {countryMetrics[country]?.orders || 0} pedidos
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            )}

            {!drillDownMode && selectedCountries.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setDrillDownMode(true)}
                className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white hover:text-white"
              >
                Ver Estados
              </Button>
            )}
          </div>
        </div>

        {/* Países selecionados - apenas mostrar quando não estiver em drill-down */}
        {!drillDownMode && selectedCountries.length > 0 && (
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
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400 text-center">
              {drillDownMode 
                ? "Nenhum estado encontrado para os países selecionados."
                : "Selecione pelo menos um país para visualizar o gráfico."
              }
            </p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey={drillDownMode ? "state" : "country"}
                  stroke="#9ca3af"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                  labelFormatter={(label) => `${drillDownMode ? 'Estado' : 'País'}: ${label}`}
                />
                <Bar 
                  dataKey={sortBy}
                  fill={sortBy === 'revenue' ? '#22c55e' : '#3b82f6'}
                  radius={[4, 4, 0, 0]}
                  onClick={handleBarClick}
                  style={{ cursor: drillDownMode ? 'default' : 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
            {!drillDownMode && (
              <div className="mt-2 text-center">
                <p className="text-xs text-slate-400">
                  Clique em uma barra para ver os dados por estado ou use o botão "Ver Estados"
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
