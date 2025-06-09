
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { startOfDay, endOfDay, format } from 'date-fns';

interface MonthlyKPIs {
  totalSpent: number;
  totalRevenue: number;
  totalOrders: number;
  avgROI: number;
}

export const useMonthlyKPIs = (dateRange: { from: Date; to: Date }) => {
  const [kpis, setKpis] = useState<MonthlyKPIs>({
    totalSpent: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgROI: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMonthlyKPIs = async () => {
    try {
      setLoading(true);
      
      // Format dates to Brazil timezone with proper start/end of day
      const startDate = startOfDay(dateRange.from);
      const endDate = endOfDay(dateRange.to);
      
      // Format as Brazil timezone string properly
      const formatDateForBrazil = (date: Date) => {
        // Create a new date adjusted to Brazil timezone (-3 hours from UTC)
        const brazilDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
        return format(brazilDate, "yyyy-MM-dd HH:mm:ss'+00:00'");
      };

      const startDateStr = formatDateForBrazil(startDate);
      const endDateStr = formatDateForBrazil(endDate);

      console.log('Date filtering - Start:', startDateStr, 'End:', endDateStr);

      // Buscar dados de campanhas no período selecionado
      const { data: campaignData, error: campaignError } = await supabase
        .from('creative_insights')
        .select('amount_spent, clicks')
        .gte('date_reported', startDateStr)
        .lte('date_reported', endDateStr);

      if (campaignError) {
        throw campaignError;
      }

      // Buscar dados de vendas no período selecionado - apenas vendas completas
      const { data: salesData, error: salesError } = await supabase
        .from('creative_sales')
        .select('gross_value, status')
        .eq('status', 'completed')
        .gte('sale_date', startDateStr)
        .lte('sale_date', endDateStr);

      if (salesError) {
        throw salesError;
      }

      // Calcular métricas
      const totalSpent = campaignData?.reduce((acc, campaign) => acc + (campaign.amount_spent || 0), 0) || 0;
      
      // Usar apenas vendas completadas para o cálculo
      const totalRevenue = salesData?.reduce((acc, sale) => acc + (sale.gross_value || 0), 0) || 0;
      const totalOrders = salesData?.length || 0;
      
      // Calcular ROI correto: se não houve investimento, ROI é 0
      // Se houve investimento, ROI = receita total / investimento total
      const avgROI = totalSpent > 0 ? totalRevenue / totalSpent : 0;

      console.log('KPI Calculation:', {
        totalSpent,
        totalRevenue,
        totalOrders,
        avgROI,
        campaignDataLength: campaignData?.length,
        salesDataLength: salesData?.length
      });

      setKpis({
        totalSpent,
        totalRevenue,
        totalOrders,
        avgROI
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
