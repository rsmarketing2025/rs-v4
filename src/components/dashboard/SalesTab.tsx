
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, DollarSign, ShoppingCart, RefreshCw, CreditCard, Download, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SalesChart } from "./SalesChart";
import { CreativesSalesChart } from "./CreativesSalesChart";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, [dateRange]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('creative_sales')
        .select('*');

      // Apply date filter
      if (dateRange.from && dateRange.to) {
        query = query
          .gte('sale_date', dateRange.from.toISOString())
          .lte('sale_date', dateRange.to.toISOString());
      }

      const { data, error } = await query.order('sale_date', { ascending: false });

      if (error) {
        throw error;
      }

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

  const displayedSales = filteredSales.slice(0, 20);

  // Get unique countries and states for filters
  const uniqueCountries = [...new Set(sales.map(sale => sale.country).filter(Boolean))].sort();
  const uniqueStates = [...new Set(sales.map(sale => sale.state).filter(Boolean))].sort();

  const totalMetrics = filteredSales.reduce((acc, sale) => ({
    revenue: acc.revenue + (sale.status === 'completed' ? (sale.gross_value || 0) : 0),
    orders: acc.orders + 1,
    refundedValue: acc.refundedValue + (sale.status === 'refunded' ? (sale.gross_value || 0) : 0),
    chargebackValue: acc.chargebackValue + (sale.status === 'chargeback' ? (sale.gross_value || 0) : 0),
  }), { revenue: 0, orders: 0, refundedValue: 0, chargebackValue: 0 });

  // Regional metrics
  const regionalMetrics = filteredSales.reduce((acc, sale) => {
    const country = sale.country || 'Não informado';
    const state = sale.state || 'Não informado';
    
    if (!acc[country]) {
      acc[country] = { orders: 0, revenue: 0, states: {} };
    }
    
    acc[country].orders += 1;
    if (sale.status === 'completed') {
      acc[country].revenue += (sale.gross_value || 0);
    }
    
    if (!acc[country].states[state]) {
      acc[country].states[state] = { orders: 0, revenue: 0 };
    }
    acc[country].states[state].orders += 1;
    if (sale.status === 'completed') {
      acc[country].states[state].revenue += (sale.gross_value || 0);
    }
    
    return acc;
  }, {} as Record<string, { orders: number; revenue: number; states: Record<string, { orders: number; revenue: number }> }>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "bg-green-500/20 text-green-400";
      case 'refunded': return "bg-red-500/20 text-red-400";
      case 'chargeback': return "bg-orange-500/20 text-orange-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'refunded': return 'Reembolsado';
      case 'chargeback': return 'Chargeback';
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

  const exportToCSV = () => {
    const headers = ['Pedido', 'Data', 'Cliente', 'Criativo', 'Status', 'Pagamento', 'Valor Bruto', 'País', 'Estado', 'Afiliado'];
    const csvData = [
      headers.join(','),
      ...displayedSales.map(sale => [
        `"${sale.order_id}"`,
        sale.sale_date ? format(new Date(sale.sale_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
        `"${sale.customer_name}"`,
        `"${sale.creative_name}"`,
        getStatusLabel(sale.status),
        getPaymentMethodLabel(sale.payment_method),
        (sale.gross_value || 0).toFixed(2),
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Receita Total</p>
                <p className="text-xl font-bold text-white">
                  R$ {totalMetrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Total de Pedidos</p>
                <p className="text-xl font-bold text-white">
                  {totalMetrics.orders.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-slate-400">Valor Reembolsado</p>
                <p className="text-xl font-bold text-white">
                  R$ {totalMetrics.refundedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-slate-400">Total de Chargeback</p>
                <p className="text-xl font-bold text-white">
                  R$ {totalMetrics.chargebackValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Analysis Card */}
      {Object.keys(regionalMetrics).length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Análise Regional
            </CardTitle>
            <CardDescription className="text-slate-400">
              Distribuição de vendas por região
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(regionalMetrics)
                .sort(([,a], [,b]) => b.revenue - a.revenue)
                .slice(0, 6)
                .map(([country, data]) => (
                <div key={country} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <h4 className="text-white font-medium mb-2">{country}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pedidos:</span>
                      <span className="text-white">{data.orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Receita:</span>
                      <span className="text-green-400">
                        R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estados:</span>
                      <span className="text-white">{Object.keys(data.states).length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <SalesChart sales={filteredSales} />
      <CreativesSalesChart sales={filteredSales} />

      {/* Filters */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por pedido, criativo ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
                <SelectItem value="chargeback">Chargeback</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">Todos os Métodos</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao_credito">Cartão</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">Todos os Países</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">Todos os Estados</SelectItem>
                {uniqueStates.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPaymentFilter("all");
                setCountryFilter("all");
                setStateFilter("all");
              }}
              variant="outline" 
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Histórico de Vendas</CardTitle>
            <CardDescription className="text-slate-400">
              Mostrando {Math.min(displayedSales.length, 20)} de {filteredSales.length} vendas
            </CardDescription>
          </div>
          <Button 
            onClick={exportToCSV}
            variant="outline" 
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Pedido</TableHead>
                  <TableHead className="text-slate-300">Data</TableHead>
                  <TableHead className="text-slate-300">Cliente</TableHead>
                  <TableHead className="text-slate-300">Criativo</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Pagamento</TableHead>
                  <TableHead className="text-slate-300">Valor Bruto</TableHead>
                  <TableHead className="text-slate-300">País</TableHead>
                  <TableHead className="text-slate-300">Estado</TableHead>
                  <TableHead className="text-slate-300">Afiliado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-slate-400 py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : displayedSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-slate-400 py-8">
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedSales.map((sale) => (
                    <TableRow key={sale.id} className="border-slate-700 hover:bg-slate-800/50">
                      <TableCell className="text-white font-medium">
                        {sale.order_id}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {sale.sale_date ? format(new Date(sale.sale_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {sale.customer_name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {sale.creative_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(sale.status)}>
                          {getStatusLabel(sale.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {getPaymentMethodLabel(sale.payment_method)}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        R$ {(sale.gross_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {sale.country || '-'}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {sale.state || '-'}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {sale.is_affiliate ? (
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                            {sale.affiliate_name || 'Afiliado'}
                          </Badge>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
