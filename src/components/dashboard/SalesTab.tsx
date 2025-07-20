
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SalesFilters } from "./sales/SalesFilters";
import { SalesTable } from "./sales/SalesTable";
import { SalesChart } from "./SalesChart";
import { CountrySalesChart } from "./sales/CountrySalesChart";
import { format, startOfDay, endOfDay } from "date-fns";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

interface Sale {
  id: string;
  order_id: string;
  creative_name: string;
  status: string;
  payment_method: string;
  gross_value: number;
  net_value: number;
  customer_name: string;
  customer_email: string;
  affiliate_name: string;
  is_affiliate: boolean;
  affiliate_commission: number;
  sale_date: string;
  country: string;
  state: string;
}

interface SalesTabProps {
  dateRange: { from: Date; to: Date };
}

export const SalesTab: React.FC<SalesTabProps> = ({ dateRange }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [chartCountryFilter, setChartCountryFilter] = useState("all");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, [dateRange]);

  // Resetar filtro de estado quando o país mudar
  useEffect(() => {
    if (countryFilter === "all") {
      setStateFilter("all");
    }
  }, [countryFilter]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('creative_sales')
        .select('*');

      // Apply date filter with proper timezone handling
      if (dateRange.from && dateRange.to) {
        // Get the start and end of the selected days in local time
        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        
        // Format dates to ISO string in local timezone
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        console.log('Sales date filtering - Start:', startDateStr, 'End:', endDateStr);
        console.log('Original date range - From:', dateRange.from, 'To:', dateRange.to);

        query = query
          .gte('sale_date', startDateStr)
          .lte('sale_date', endDateStr);
      }

      const { data, error } = await query.order('sale_date', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Fetched sales data:', data?.length);
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de vendas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.creative_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || sale.payment_method === paymentFilter;
    const matchesCountry = countryFilter === "all" || sale.country === countryFilter;
    const matchesState = stateFilter === "all" || sale.state === stateFilter;
    return matchesSearch && matchesStatus && matchesPayment && matchesCountry && matchesState;
  });

  // Get unique countries and states for filters
  const uniqueCountries = [...new Set(sales.map(sale => sale.country).filter(Boolean))].sort();
  const uniqueStates = [...new Set(sales.map(sale => sale.state).filter(Boolean))].sort();

  // Prepare state data for StateSalesChart
  const stateData = sales.reduce((acc, sale) => {
    if (!sale.state || (chartCountryFilter !== "all" && sale.country !== chartCountryFilter)) return acc;
    
    const existing = acc.find(item => item.state === sale.state);
    if (existing) {
      existing.total_sales += 1;
      if (sale.status === 'completed' || sale.status === 'Unfulfilled') {
        existing.total_revenue += (sale.net_value || 0);
      }
    } else {
      acc.push({
        state: sale.state,
        total_sales: 1,
        total_revenue: (sale.status === 'completed' || sale.status === 'Unfulfilled') ? (sale.net_value || 0) : 0
      });
    }
    return acc;
  }, [] as Array<{ state: string; total_sales: number; total_revenue: number }>);

  // Filter state data for chart
  const filteredStateData = stateData.sort((a, b) => b.total_revenue - a.total_revenue);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setCountryFilter("all");
    setStateFilter("all");
  };

  const exportToCSV = () => {
    const displayedSales = filteredSales.slice(0, 20);
    const headers = ['Pedido', 'Data', 'Cliente', 'Criativo', 'Status', 'Pagamento', 'Valor Líquido', 'País', 'Estado', 'Afiliado'];
    
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'completed': return 'Concluído';
        case 'refunded': return 'Reembolsado';
        case 'chargeback': return 'Chargeback';
        case 'Unfulfilled': return 'Não Cumprido';
        default: return status;
      }
    };

    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case 'pix': return 'PIX';
        case 'cartao_credito': return 'Cartão de Crédito';
        case 'boleto': return 'Boleto';
        default: return method;
      }
    };

    const csvData = [
      headers.join(','),
      ...displayedSales.map(sale => [
        `"${sale.order_id}"`,
        sale.sale_date ? format(new Date(sale.sale_date), 'dd/MM/yyyy HH:mm') : '-',
        `"${sale.customer_name}"`,
        `"${sale.creative_name}"`,
        getStatusLabel(sale.status),
        getPaymentMethodLabel(sale.payment_method),
        (sale.net_value || 0).toFixed(2),
        `"${sale.country || 'Não informado'}"`,
        `"${sale.state || 'Não informado'}"`,
        sale.is_affiliate ? `"${sale.affiliate_name || 'Afiliado'}"` : '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'vendas_regionais.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <PermissionWrapper requirePage="charts" fallback={
        <div className="bg-slate-800/30 rounded-lg p-4 text-center">
          <p className="text-slate-400">Sem permissão para visualizar gráficos</p>
        </div>
      }>
        <div className="space-y-6">
          {/* Revenue and Status Charts */}
          <SalesChart sales={sales} dateRange={dateRange} />
          
          {/* Regional Analysis Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
            <CountrySalesChart 
              sales={sales} 
              countryFilter={chartCountryFilter}
            />
          </div>
        </div>
      </PermissionWrapper>

      {/* Filters and Table Section */}
      <PermissionWrapper requirePage="tables" fallback={
        <div className="bg-slate-800/30 rounded-lg p-4 text-center">
          <p className="text-slate-400">Sem permissão para visualizar tabelas</p>
        </div>
      }>
        <SalesFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          paymentFilter={paymentFilter}
          setPaymentFilter={setPaymentFilter}
          countryFilter={countryFilter}
          setCountryFilter={setCountryFilter}
          stateFilter={stateFilter}
          setStateFilter={setStateFilter}
          uniqueCountries={uniqueCountries}
          uniqueStates={uniqueStates}
          onClearFilters={handleClearFilters}
        />
        
        <PermissionWrapper requirePage="exports" fallback={
          <SalesTable
            sales={sales}
            filteredSales={filteredSales}
            loading={loading}
            onExportCSV={() => {
              alert('Sem permissão para exportar dados');
            }}
          />
        }>
          <SalesTable
            sales={sales}
            filteredSales={filteredSales}
            loading={loading}
            onExportCSV={exportToCSV}
          />
        </PermissionWrapper>
      </PermissionWrapper>
    </div>
  );
};
