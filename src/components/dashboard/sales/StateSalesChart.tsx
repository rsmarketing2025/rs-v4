
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StateSalesData {
  state: string;
  total_sales: number;
  total_revenue: number;
}

interface StateSalesChartProps {
  stateData: StateSalesData[];
  countryFilter: string;
  onCountryFilterChange: (country: string) => void;
  uniqueCountries: string[];
  filteredStateData: StateSalesData[];
}

export const StateSalesChart: React.FC<StateSalesChartProps> = ({ 
  stateData, 
  countryFilter, 
  onCountryFilterChange, 
  uniqueCountries,
  filteredStateData 
}) => {
  const topStates = filteredStateData.slice(0, 10).map(state => ({
    name: state.state,
    sales: state.total_sales,
    revenue: state.total_revenue,
  }));

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white">Vendas por Estado</CardTitle>
            <CardDescription className="text-slate-400">
              Top 10 estados com maior volume de vendas
            </CardDescription>
          </div>
          <div className="w-48">
            <Select value={countryFilter} onValueChange={onCountryFilterChange}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Filtrar por país" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">Todos os países</SelectItem>
                {uniqueCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topStates}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString('pt-BR')}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: any, name: string) => [
                name === 'sales' ? value.toLocaleString('pt-BR') : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                name === 'sales' ? 'Vendas' : 'Receita'
              ]}
            />
            <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
