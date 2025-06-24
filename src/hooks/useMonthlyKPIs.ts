
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { startOfDay, endOfDay, format } from 'date-fns';

interface MonthlyKPIs {
  totalSpent: number;
  totalRevenue: number;
  totalOrders: number;
  avgROI: number;
  avgTicket: number;
  totalCancellations: number;
}

export const useMonthlyKPIs = (dateRange: { from: Date; to: Date }) => {
  const [kpis, setKpis] = useState<MonthlyKPIs>({
    totalSpent: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgROI: 0,
    avgTicket: 0,
    totalCancellations: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMonthlyKPIs = async () => {
    try {
      setLoading(true);
      
      // Get the start and end of the selected days in local time
      const startDate = startOfDay(dateRange.from);
      const endDate = endOfDay(dateRange.to);
      
      // Format dates to ISO string in local timezone - same as SalesTab
      const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

      console.log('KPI Date filtering - Start:', startDateStr, 'End:', endDateStr);
      console.log('KPI Original date range - From:', dateRange.from, 'To:', dateRange.to);

      // Buscar dados de campanhas no período selecionado
      const { data: campaignData, error: campaignError } = await supabase
        .from('creative_insights')
        .select('amount_spent, clicks')
        .gte('date_reported', startDateStr)
        .lte('date_reported', endDateStr);

      if (campaignError) {
        throw campaignError;
      }

      // Use net_value for revenue calculation and include both completed and Unfulfilled
      const { data: salesData, error: salesError } = await supabase
        .from('creative_sales')
        .select('net_value, status')
        .in('status', ['completed', 'Unfulfilled'])
        .gte('sale_date', startDateStr)
        .lte('sale_date', endDateStr);

      if (salesError) {
        throw salesError;
      }

      // Buscar cancelamentos no período selecionado usando subscription_status
      const { data: cancellationsData, error: cancellationsError } = await supabase
        .from('subscription_status')
        .select('id, subscription_status, updated_at')
        .eq('subscription_status', 'Cancelado')
        .gte('updated_at', startDateStr)
        .lte('updated_at', endDateStr);

      if (cancellationsError) {
        throw cancellationsError;
      }

      console.log('KPI Campaign data:', campaignData?.length, 'KPI Sales data:', salesData?.length, 'KPI Cancellations data:', cancellationsData?.length);

      // Calcular métricas
      const totalSpent = campaignData?.reduce((acc, campaign) => acc + (campaign.amount_spent || 0), 0) || 0;
      
      // Use net_value for revenue calculation
      const totalRevenue = salesData?.reduce((acc, sale) => acc + (sale.net_value || 0), 0) || 0;
      const totalOrders = salesData?.length || 0;
      
      // Calcular ticket médio
      const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Calcular total de cancelamentos
      const totalCancellations = cancellationsData?.length || 0;
      
      // Calcular ROI usando a fórmula: (Receita Total - Total Investido) / Total Investido
      // Limitado a 2 casas decimais
      const avgROI = totalSpent > 0 ? Number(((totalRevenue - totalSpent) / totalSpent).toFixed(2)) : 0;

      console.log('🔍 KPI Calculation Debug:', {
        totalSpent,
        totalRevenue,
        totalOrders,
        avgROI,
        avgTicket,
        totalCancellations,
        roiFormula: `(${totalRevenue} - ${totalSpent}) / ${totalSpent} = ${avgROI}`,
        rawROI: totalSpent > 0 ? (totalRevenue - totalSpent) / totalSpent : 0,
        formattedROI: totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent).toFixed(2) : '0.00',
        campaignDataLength: campaignData?.length,
        salesDataLength: salesData?.length,
        cancellationsDataLength: cancellationsData?.length
      });

      setKpis({
        totalSpent,
        totalRevenue,
        totalOrders,
        avgROI,
        avgTicket,
        totalCancellations
      });
    } catch (error) {
      console.error('Error fetching monthly KPIs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as métricas mensais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyKPIs();
  }, [dateRange]);

  return { kpis, loading, refetch: fetchMonthlyKPIs };
};
