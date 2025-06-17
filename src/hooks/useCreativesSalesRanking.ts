
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, endOfDay } from 'date-fns';

interface CreativeRankingData {
  creative_name: string;
  total_sales: number;
  total_revenue: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

export const useCreativesSalesRanking = (dateRange: DateRange) => {
  const [rankingData, setRankingData] = useState<CreativeRankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRankingData = async () => {
    try {
      setLoading(true);
      
      // Get the start and end of the selected days in local time
      const startDate = startOfDay(dateRange.from);
      const endDate = endOfDay(dateRange.to);
      
      // Format dates to ISO string in local timezone
      const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

      console.log('Creative sales ranking - Start:', startDateStr, 'End:', endDateStr);

      // Fetch sales data for the period - Include both "completed" and "Unfulfilled" sales
      const { data: salesData, error: salesError } = await supabase
        .from('creative_sales')
        .select('creative_name, status, net_value')
        .in('status', ['completed', 'Unfulfilled'])
        .gte('sale_date', startDateStr)
        .lte('sale_date', endDateStr);

      if (salesError) {
        throw salesError;
      }

      console.log('Raw sales data for creative ranking:', salesData?.length);

      if (!salesData || salesData.length === 0) {
        setRankingData([]);
        return;
      }

      // Process data for ranking - group by creative_name
      const creativesMetrics = salesData.reduce((acc, sale) => {
        // Normalize creative name - treat empty, null, or whitespace-only as "Não informado"
        const creativeName = (sale.creative_name && sale.creative_name.trim()) 
          ? sale.creative_name.trim() 
          : 'Não informado';
        
        if (!acc[creativeName]) {
          acc[creativeName] = { 
            total_sales: 0, 
            total_revenue: 0
          };
        }
        
        acc[creativeName].total_sales += 1;
        acc[creativeName].total_revenue += (sale.net_value || 0);
        
        return acc;
      }, {} as Record<string, { total_sales: number; total_revenue: number }>);

      // Transform to ranking data and sort by revenue
      const rankingData: CreativeRankingData[] = Object.entries(creativesMetrics)
        .map(([creative_name, metrics]) => ({
          creative_name,
          total_sales: metrics.total_sales,
          total_revenue: metrics.total_revenue
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue); // Sort by revenue desc

      console.log('Processed creative ranking data:', rankingData.slice(0, 5));

      setRankingData(rankingData);

    } catch (error) {
      console.error('Error fetching creative sales ranking:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o ranking de criativos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankingData();
  }, [dateRange]);

  return { 
    rankingData, 
    loading, 
    refetch: fetchRankingData
  };
};
