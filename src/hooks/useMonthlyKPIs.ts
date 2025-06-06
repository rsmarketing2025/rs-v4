
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MonthlyKPIs {
  totalSpent: number;
  totalRevenue: number;
  totalOrders: number;
  roas: number;
  conversionRate: number;
  avgOrderValue: number;
}

export const useMonthlyKPIs = () => {
  const [kpis, setKpis] = useState<MonthlyKPIs>({
    totalSpent: 0,
    totalRevenue: 0,
    totalOrders: 0,
    roas: 0,
    conversionRate: 0,
    avgOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMonthlyKPIs = async () => {
    try {
      setLoading(true);
      
      // Obter primeiro e último dia do mês atual
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Buscar dados de campanhas do mês atual
      const { data: campaignData, error: campaignError } = await supabase
        .from('creative_insights')
        .select('amount_spent, clicks')
        .gte('date_reported', firstDayOfMonth.toISOString())
        .lte('date_reported', lastDayOfMonth.toISOString());

      if (campaignError) {
        throw campaignError;
      }

      // Buscar dados de vendas do mês atual
      const { data: salesData, error: salesError } = await supabase
        .from('creative_sales')
        .select('gross_value, status')
        .gte('sale_date', firstDayOfMonth.toISOString())
        .lte('sale_date', lastDayOfMonth.toISOString());

      if (salesError) {
        throw salesError;
      }

      // Calcular métricas
      const totalSpent = campaignData?.reduce((acc, campaign) => acc + (campaign.amount_spent || 0), 0) || 0;
      const totalClicks = campaignData?.reduce((acc, campaign) => acc + (campaign.clicks || 0), 0) || 0;
      
      const completedSales = salesData?.filter(sale => sale.status === 'completed') || [];
      const totalRevenue = completedSales.reduce((acc, sale) => acc + (sale.gross_value || 0), 0);
      const totalOrders = completedSales.length; // Only count completed orders
      
      const roas = totalSpent > 0 ? totalRevenue / totalSpent : 0;
      const conversionRate = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setKpis({
        totalSpent,
        totalRevenue,
        totalOrders,
        roas,
        conversionRate,
        avgOrderValue
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
  }, []);

  return { kpis, loading, refetch: fetchMonthlyKPIs };
};
