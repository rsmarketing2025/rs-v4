
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, DollarSign, ShoppingCart, TrendingUp, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SalesChart } from "./SalesChart";
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
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalMetrics = filteredSales.reduce((acc, sale) => ({
    revenue: acc.revenue + (sale.status === 'completed' ? (sale.gross_value || 0) : 0),
    orders: acc.orders + 1,
    completedOrders: acc.completedOrders + (sale.status === 'completed' ? 1 : 0),
    avgOrderValue: 0, // Will be calculated after
  }), { revenue: 0, orders: 0, completedOrders: 0, avgOrderValue: 0 });

  totalMetrics.avgOrderValue = totalMetrics.completedOrders > 0 ? totalMetrics.revenue / totalMetrics.completedOrders : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "bg-green-500/20 text-green-400";
      case 'refunded': return "bg-red-500/20 text-red-400";
      case 'chargeback': return "bg-orange-500/20 text-orange-400";
      default: return "bg-slate-500/20 text-slate-400";
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
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Pedidos Concluídos</p>
                <p className="text-xl font-bold text-white">
                  {totalMetrics.completedOrders.toLocaleString()}
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
                <p className="text-sm text-slate-400">Ticket Médio</p>
                <p className="text-xl font-bold text-white">
                  R$ {totalMetrics.avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <SalesChart sales={filteredSales} />

      {/* Filters */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por pedido, criativo ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-900/50 border-slate-600 text-white">
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
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">Todos os Métodos</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao_credito">Cartão</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Vendas</CardTitle>
          <CardDescription className="text-slate-400">
            {filteredSales.length} vendas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                  <TableHead className="text-slate-300">Afiliado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
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
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {getPaymentMethodLabel(sale.payment_method)}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        R$ {(sale.gross_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
