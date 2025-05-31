
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Users, DollarSign, TrendingUp, Percent, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AffiliateChart } from "./AffiliateChart";

interface AffiliateData {
  affiliate_id: string;
  affiliate_name: string;
  total_sales: number;
  completed_sales: number;
  total_revenue: number;
  total_commission: number;
  conversion_rate: number;
  avg_order_value: number;
}

interface AffiliatesTabProps {
  dateRange: { from: Date; to: Date };
}

export const AffiliatesTab: React.FC<AffiliatesTabProps> = ({ dateRange }) => {
  const [affiliates, setAffiliates] = useState<AffiliateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliates();
  }, [dateRange]);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('creative_sales')
        .select('*')
        .eq('is_affiliate', true);

      // Apply date filter
      if (dateRange.from && dateRange.to) {
        query = query
          .gte('sale_date', dateRange.from.toISOString())
          .lte('sale_date', dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Process affiliate data
      const affiliateMap = new Map<string, any>();
      
      data?.forEach(sale => {
        const key = sale.affiliate_id || 'unknown';
        const name = sale.affiliate_name || 'Afiliado Desconhecido';
        
        if (!affiliateMap.has(key)) {
          affiliateMap.set(key, {
            affiliate_id: key,
            affiliate_name: name,
            total_sales: 0,
            completed_sales: 0,
            total_revenue: 0,
            total_commission: 0,
            sales: []
          });
        }
        
        const affiliate = affiliateMap.get(key);
        affiliate.total_sales += 1;
        
        if (sale.status === 'completed') {
          affiliate.completed_sales += 1;
          affiliate.total_revenue += sale.gross_value || 0;
          affiliate.total_commission += sale.affiliate_commission || 0;
        }
        
        affiliate.sales.push(sale);
      });

      // Calculate derived metrics
      const affiliateData: AffiliateData[] = Array.from(affiliateMap.values()).map(affiliate => ({
        ...affiliate,
        conversion_rate: affiliate.total_sales > 0 ? (affiliate.completed_sales / affiliate.total_sales) * 100 : 0,
        avg_order_value: affiliate.completed_sales > 0 ? affiliate.total_revenue / affiliate.completed_sales : 0,
      }));

      setAffiliates(affiliateData.sort((a, b) => b.total_revenue - a.total_revenue));
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos afiliados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAffiliates = affiliates.filter(affiliate =>
    affiliate.affiliate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.affiliate_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedAffiliates = filteredAffiliates.slice(0, 20);

  const totalMetrics = filteredAffiliates.reduce((acc, affiliate) => ({
    affiliates: acc.affiliates + 1,
    revenue: acc.revenue + affiliate.total_revenue,
    commission: acc.commission + affiliate.total_commission,
    sales: acc.sales + affiliate.total_sales,
  }), { affiliates: 0, revenue: 0, commission: 0, sales: 0 });

  const exportToCSV = () => {
    const headers = ['Afiliado', 'ID', 'Total Vendas', 'Vendas Concluídas', 'Taxa Conversão', 'Receita Total', 'Comissão Total', 'Ticket Médio'];
    const csvData = [
      headers.join(','),
      ...displayedAffiliates.map((affiliate, index) => [
        `"${affiliate.affiliate_name}"`,
        `"${affiliate.affiliate_id}"`,
        affiliate.total_sales,
        affiliate.completed_sales,
        affiliate.conversion_rate.toFixed(1) + '%',
        affiliate.total_revenue.toFixed(2),
        affiliate.total_commission.toFixed(2),
        affiliate.avg_order_value.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'afiliados.csv');
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
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Total de Afiliados</p>
                <p className="text-xl font-bold text-white">
                  {totalMetrics.affiliates}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Receita de Afiliados</p>
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
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Comissões Pagas</p>
                <p className="text-xl font-bold text-white">
                  R$ {totalMetrics.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Percent className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-slate-400">Vendas de Afiliados</p>
                <p className="text-xl font-bold text-white">
                  {totalMetrics.sales}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <AffiliateChart affiliates={filteredAffiliates} />

      {/* Search */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Buscar Afiliados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou ID do afiliado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Affiliates Table */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Performance dos Afiliados</CardTitle>
            <CardDescription className="text-slate-400">
              Mostrando {Math.min(displayedAffiliates.length, 20)} de {filteredAffiliates.length} afiliados
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
                  <TableHead className="text-slate-300">Afiliado</TableHead>
                  <TableHead className="text-slate-300">ID</TableHead>
                  <TableHead className="text-slate-300">Total Vendas</TableHead>
                  <TableHead className="text-slate-300">Vendas Concluídas</TableHead>
                  <TableHead className="text-slate-300">Taxa Conversão</TableHead>
                  <TableHead className="text-slate-300">Receita Total</TableHead>
                  <TableHead className="text-slate-300">Comissão Total</TableHead>
                  <TableHead className="text-slate-300">Ticket Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : displayedAffiliates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                      Nenhum afiliado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedAffiliates.map((affiliate, index) => (
                    <TableRow key={affiliate.affiliate_id} className="border-slate-700 hover:bg-slate-800/50">
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <span>{affiliate.affiliate_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 font-mono text-sm">
                        {affiliate.affiliate_id}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {affiliate.total_sales}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {affiliate.completed_sales}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <Badge 
                          variant="secondary"
                          className={
                            affiliate.conversion_rate >= 80 
                              ? "bg-green-500/20 text-green-400" 
                              : affiliate.conversion_rate >= 60
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {affiliate.conversion_rate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        R$ {affiliate.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        R$ {affiliate.total_commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        R$ {affiliate.avg_order_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
