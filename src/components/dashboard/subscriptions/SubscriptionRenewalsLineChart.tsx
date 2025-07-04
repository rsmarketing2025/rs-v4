
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscriptionRenewals } from "@/hooks/useSubscriptionRenewals";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/dateUtils";

interface SubscriptionRenewalsLineChartProps {
  dateRange: { from: Date; to: Date };
}

// Cores para diferentes planos
const PLAN_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6366f1', // indigo
];

type FilterMode = 'all' | 'specific' | 'comparison';

export const SubscriptionRenewalsLineChart: React.FC<SubscriptionRenewalsLineChartProps> = ({
  dateRange
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');

  const { renewals, loading } = useSubscriptionRenewals(
    dateRange,
    { plan: 'all', eventType: 'all', paymentMethod: 'all', status: 'all' },
    1,
    1000
  );

  // Obter planos únicos disponíveis
  const availablePlans = useMemo(() => {
    if (!renewals || renewals.length === 0) return [];
    
    const plans = [...new Set(renewals.map(renewal => renewal.plan))].filter(Boolean);
    return plans.sort();
  }, [renewals]);

  // Processar dados para o gráfico
  const chartData = useMemo(() => {
    if (!renewals || renewals.length === 0) return [];
    
    // Agrupar dados por data
    const groupedByDate = renewals.reduce((acc, renewal) => {
      const date = new Date(renewal.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
      
      if (!acc[date]) {
        acc[date] = { date, total: 0 };
        // Inicializar todos os planos com 0
        availablePlans.forEach(plan => {
          acc[date][plan] = 0;
        });
      }
      
      acc[date].total += renewal.amount;
      acc[date][renewal.plan] = (acc[date][renewal.plan] || 0) + renewal.amount;
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(groupedByDate).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    );
  }, [renewals, availablePlans]);

  // Renderizar linhas baseado no modo de filtro
  const renderLines = () => {
    if (filterMode === 'all') {
      return (
        <Line
          type="monotone"
          dataKey="total"
          stroke={PLAN_COLORS[0]}
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Todos os Planos"
        />
      );
    } else if (filterMode === 'specific' && selectedPlan !== 'all') {
      return (
        <Line
          type="monotone"
          dataKey={selectedPlan}
          stroke={PLAN_COLORS[0]}
          strokeWidth={2}
          dot={{ r: 4 }}
          name={selectedPlan}
        />
      );
    } else if (filterMode === 'comparison') {
      return availablePlans.map((plan, index) => (
        <Line
          key={plan}
          type="monotone"
          dataKey={plan}
          stroke={PLAN_COLORS[index % PLAN_COLORS.length]}
          strokeWidth={2}
          dot={{ r: 4 }}
          name={plan}
        />
      ));
    }
    return null;
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getChartTitle = () => {
    switch (filterMode) {
      case 'all':
        return 'Renovações - Todos os Planos';
      case 'specific':
        return `Renovações - ${selectedPlan !== 'all' ? selectedPlan : 'Plano Específico'}`;
      case 'comparison':
        return 'Renovações - Comparação entre Planos';
      default:
        return 'Renovações de Assinaturas';
    }
  };

  const getChartDescription = () => {
    switch (filterMode) {
      case 'all':
        return 'Receita total de renovações ao longo do tempo';
      case 'specific':
        return `Receita de renovações do plano selecionado`;
      case 'comparison':
        return 'Comparação da receita entre diferentes planos';
      default:
        return 'Evolução das renovações de assinaturas';
    }
  };

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {getChartTitle()}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {getChartDescription()}
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Seletor de modo de filtro */}
            <Select value={filterMode} onValueChange={(value: FilterMode) => setFilterMode(value)}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white backdrop-blur-sm w-full sm:w-48">
                <SelectValue placeholder="Modo de visualização" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-slate-700/50 backdrop-blur-sm">
                <SelectItem value="all">Todos os Planos</SelectItem>
                <SelectItem value="specific">Plano Específico</SelectItem>
                <SelectItem value="comparison">Comparação</SelectItem>
              </SelectContent>
            </Select>

            {/* Seletor de plano específico (apenas quando filterMode === 'specific') */}
            {filterMode === 'specific' && (
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white backdrop-blur-sm w-full sm:w-48">
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 border-slate-700/50 backdrop-blur-sm">
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-slate-400">Carregando dados...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-400 text-lg mb-2">📊 Nenhum dado encontrado</div>
              <div className="text-slate-500 text-sm">
                Não há dados de renovações para o período selecionado
              </div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              {(filterMode === 'comparison' || filterMode === 'specific') && (
                <Legend 
                  wrapperStyle={{ color: '#94a3b8' }}
                />
              )}
              {renderLines()}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
