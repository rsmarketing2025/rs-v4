
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, format } from 'date-fns';

interface CreativeRankingData {
  name: string;
  fullName: string;
  value: number;
}

interface TopTenChartProps {
  dateRange: { from: Date; to: Date };
}

export const TopTenChart: React.FC<TopTenChartProps> = ({ dateRange }) => {
  const [chartData, setChartData] = useState<CreativeRankingData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCreativesSalesData = async () => {
    try {
      setLoading(true);
      
      // Get the start and end of the selected days in local time
      const startDate = startOfDay(dateRange.from);
      const endDate = endOfDay(dateRange.to);
      
      // Format dates to ISO string in local timezone
      const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

      console.log('TopTenChart - Date filtering - Start:', startDateStr, 'End:', endDateStr);
      
      // Buscar dados diretamente da tabela creative_sales
      const { data: salesData, error } = await supabase
        .from('creative_sales')
        .select('creative_name, gross_value')
        .gte('sale_date', startDateStr)
        .lte('sale_date', endDateStr)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching creative sales:', error);
        throw error;
      }

      console.log('TopTenChart - Raw sales data:', salesData?.length);

      // Agrupar por creative_name e somar gross_value
      const creativesMap = new Map<string, number>();
      
      salesData?.forEach(sale => {
        const creativeName = sale.creative_name || 'Não informado';
        const currentValue = creativesMap.get(creativeName) || 0;
        creativesMap.set(creativeName, currentValue + (sale.gross_value || 0));
      });

      // Converter para array e ordenar por valor de vendas (REMOVER LIMITE)
      const sortedCreatives = Array.from(creativesMap.entries())
        .map(([creativeName, totalSales]) => ({
          name: creativeName.length > 20 
            ? creativeName.substring(0, 20) + '...' 
            : creativeName,
          fullName: creativeName,
          value: totalSales
        }))
        .filter(creative => creative.value > 0)
        .sort((a, b) => b.value - a.value);
        // Removido o .slice(0, 10) para mostrar todos os criativos

      console.log('TopTenChart - Processed ranking data:', sortedCreatives);
      setChartData(sortedCreatives);
    } catch (error) {
      console.error('Error fetching creatives sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreativesSalesData();
  }, [dateRange]);

  const formatValue = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <PermissionWrapper requirePage="creatives">
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">Ranking de vendas por Criativo</CardTitle>
            <CardDescription className="text-slate-400">
              Carregando dados...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 flex items-center justify-center text-slate-400">
              Carregando...
            </div>
          </CardContent>
        </Card>
      </PermissionWrapper>
    );
  }

  // Calcular largura dinâmica baseada no número de criativos
  const chartWidth = Math.max(800, chartData.length * 80);

  return (
    <PermissionWrapper requirePage="creatives">
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-xl">Ranking de vendas por Criativo</CardTitle>
          <CardDescription className="text-slate-400">
            Ranking dos criativos com maior valor de vendas ({chartData.length} criativos encontrados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                Nenhum criativo com vendas encontrado no período selecionado
              </div>
            ) : (
              <ScrollArea className="w-full h-full">
                <div style={{ width: chartWidth, height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name"
                        stroke="#9ca3af"
                        fontSize={11}
                        angle={-45}
                        textAnchor="end"
                        height={120}
                        interval={0}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        fontSize={12}
                        tickFormatter={formatValue}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value: any) => [
                          formatValue(value),
                          'Valor de Vendas'
                        ]}
                        labelFormatter={(label: any, payload: any) => 
                          payload?.[0]?.payload?.fullName || label
                        }
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
    </PermissionWrapper>
  );
};
