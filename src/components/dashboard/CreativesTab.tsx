
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, MousePointer, TrendingUp, DollarSign, Download, Target, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreativePerformanceChart } from "./CreativePerformanceChart";

interface CreativeMetrics {
  id: string;
  creative_name: string;
  campaign_name: string;
  start_date: string;
  end_date: string;
  amount_spent: number;
  views_3s: number;
  views_75_percent: number;
  views_total: number;
  pr_hook_rate: number;
  hook_rate: number;
  body_rate: number;
  cta_rate: number;
  ctr: number;
  conv_body_rate: number;
  sales_count: number;
  gross_sales: number;
  profit: number;
  cpa: number;
  roi: number;
  status: string;
}

interface CreativesTabProps {
  dateRange: { from: Date; to: Date };
}

export const CreativesTab: React.FC<CreativesTabProps> = ({ dateRange }) => {
  const [creatives, setCreatives] = useState<CreativeMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchCreatives();
  }, [dateRange]);

  const fetchCreatives = async () => {
    try {
      setLoading(true);
      
      // Buscar dados das campanhas
      let campaignQuery = supabase
        .from('creative_insights')
        .select('*');

      if (dateRange.from && dateRange.to) {
        campaignQuery = campaignQuery
          .gte('date_reported', dateRange.from.toISOString())
          .lte('date_reported', dateRange.to.toISOString());
      }

      const { data: campaignData, error: campaignError } = await campaignQuery;

      if (campaignError) {
        throw campaignError;
      }

      // Buscar dados das vendas
      let salesQuery = supabase
        .from('creative_sales')
        .select('*');

      if (dateRange.from && dateRange.to) {
        salesQuery = salesQuery
          .gte('sale_date', dateRange.from.toISOString())
          .lte('sale_date', dateRange.to.toISOString());
      }

      const { data: salesData, error: salesError } = await salesQuery;

      if (salesError) {
        throw salesError;
      }

      // Processar e combinar dados
      const creativesMap = new Map();

      // Processar dados de campanhas
      campaignData?.forEach(campaign => {
        const key = campaign.creative_name;
        if (!creativesMap.has(key)) {
          creativesMap.set(key, {
            creative_name: campaign.creative_name || '',
            campaign_name: campaign.campaign_name || '',
            start_date: '',
            end_date: '',
            amount_spent: 0,
            views_3s: 0,
            views_75_percent: 0,
            views_total: 0,
            pr_hook_rates: [],
            hook_rates: [],
            body_rates: [],
            cta_rates: [],
            ctrs: [],
            status: campaign.status || 'active',
            sales: []
          });
        }

        const creative = creativesMap.get(key);
        creative.amount_spent += campaign.amount_spent || 0;
        creative.views_3s += campaign.views_3s || 0;
        creative.views_75_percent += campaign.views_75_percent || 0;
        creative.views_total += campaign.views_total || 0;
        
        if (campaign.ph_hook_rate) creative.pr_hook_rates.push(campaign.ph_hook_rate);
        if (campaign.hook_rate) creative.hook_rates.push(campaign.hook_rate);
        if (campaign.body_rate) creative.body_rates.push(campaign.body_rate);
        if (campaign.cta_rate) creative.cta_rates.push(campaign.cta_rate);
        if (campaign.ctr) creative.ctrs.push(campaign.ctr);
      });

      // Processar dados de vendas
      salesData?.forEach(sale => {
        const key = sale.creative_name;
        if (creativesMap.has(key)) {
          creativesMap.get(key).sales.push(sale);
        }
      });

      // Calcular métricas finais
      const processedCreatives: CreativeMetrics[] = Array.from(creativesMap.values()).map((creative, index) => {
        const salesCount = creative.sales.length;
        const grossSales = creative.sales.reduce((sum: number, sale: any) => sum + (sale.gross_value || 0), 0);
        const profit = grossSales - creative.amount_spent;
        const cpa = salesCount > 0 ? creative.amount_spent / salesCount : 0;
        const roi = creative.amount_spent > 0 ? (grossSales / creative.amount_spent) * 100 : 0;
        const convBodyRate = creative.views_75_percent > 0 ? (salesCount / creative.views_75_percent) * 100 : 0;

        // Calcular médias
        const avgPrHookRate = creative.pr_hook_rates.length > 0 
          ? creative.pr_hook_rates.reduce((a: number, b: number) => a + b, 0) / creative.pr_hook_rates.length 
          : 0;
        const avgHookRate = creative.hook_rates.length > 0 
          ? creative.hook_rates.reduce((a: number, b: number) => a + b, 0) / creative.hook_rates.length 
          : 0;
        const avgBodyRate = creative.body_rates.length > 0 
          ? creative.body_rates.reduce((a: number, b: number) => a + b, 0) / creative.body_rates.length 
          : 0;
        const avgCtaRate = creative.cta_rates.length > 0 
          ? creative.cta_rates.reduce((a: number, b: number) => a + b, 0) / creative.cta_rates.length 
          : 0;
        const avgCtr = creative.ctrs.length > 0 
          ? creative.ctrs.reduce((a: number, b: number) => a + b, 0) / creative.ctrs.length 
          : 0;

        return {
          id: `creative-${index}`,
          creative_name: creative.creative_name,
          campaign_name: creative.campaign_name,
          start_date: dateRange.from.toLocaleDateString('pt-BR'),
          end_date: dateRange.to.toLocaleDateString('pt-BR'),
          amount_spent: creative.amount_spent,
          views_3s: creative.views_3s,
          views_75_percent: creative.views_75_percent,
          views_total: creative.views_total,
          pr_hook_rate: avgPrHookRate,
          hook_rate: avgHookRate,
          body_rate: avgBodyRate,
          cta_rate: avgCtaRate,
          ctr: avgCtr,
          conv_body_rate: convBodyRate,
          sales_count: salesCount,
          gross_sales: grossSales,
          profit: profit,
          cpa: cpa,
          roi: roi,
          status: creative.status
        };
      });

      setCreatives(processedCreatives);
    } catch (error) {
      console.error('Error fetching creatives:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos criativos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCreatives = creatives.filter(creative => {
    const matchesSearch = creative.creative_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creative.campaign_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || creative.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayedCreatives = filteredCreatives.slice(0, 20);

  const totalMetrics = filteredCreatives.reduce((acc, creative) => ({
    spent: acc.spent + creative.amount_spent,
    views: acc.views + creative.views_3s,
    sales: acc.sales + creative.sales_count,
    revenue: acc.revenue + creative.gross_sales,
  }), { spent: 0, views: 0, sales: 0, revenue: 0 });

  const avgROI = totalMetrics.spent > 0 ? (totalMetrics.revenue / totalMetrics.spent) * 100 : 0;

  const exportToCSV = () => {
    const headers = [
      'Criativo', 'Campanha', 'Período', 'Valor Gasto', 'Views 3s', 'Views 75%', 'Views Total',
      'PR Hook %', 'Hook Rate %', 'Body Rate %', 'CTA %', 'CTR %', 'Conv. Body %',
      'Qtd Vendas', 'Vendas Bruto', 'Lucro', 'CPA', 'ROI %', 'Status'
    ];
    
    const csvData = [
      headers.join(','),
      ...displayedCreatives.map(creative => [
        `"${creative.creative_name}"`,
        `"${creative.campaign_name}"`,
        `"${creative.start_date} - ${creative.end_date}"`,
        creative.amount_spent.toFixed(2),
        creative.views_3s,
        creative.views_75_percent,
        creative.views_total,
        creative.pr_hook_rate.toFixed(1),
        creative.hook_rate.toFixed(1),
        creative.body_rate.toFixed(1),
        creative.cta_rate.toFixed(1),
        creative.ctr.toFixed(2),
        creative.conv_body_rate.toFixed(2),
        creative.sales_count,
        creative.gross_sales.toFixed(2),
        creative.profit.toFixed(2),
        creative.cpa.toFixed(2),
        creative.roi.toFixed(1),
        creative.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'criativos-completo.csv');
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
              <DollarSign className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Total Investido</p>
                <p className="text-xl font-bold text-white">
                  R$ {totalMetrics.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Total Views 3s</p>
                <p className="text-xl font-bold text-white">
                  {totalMetrics.views.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Total Vendas</p>
                <p className="text-xl font-bold text-white">
                  {totalMetrics.sales.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-slate-400">ROI Médio</p>
                <p className="text-xl font-bold text-white">
                  {avgROI.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <CreativePerformanceChart creatives={filteredCreatives} />

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
                placeholder="Buscar criativos ou campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Creatives Table */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Performance Completa dos Criativos</CardTitle>
            <CardDescription className="text-slate-400">
              Mostrando {Math.min(displayedCreatives.length, 20)} de {filteredCreatives.length} criativos
            </CardDescription>
          </div>
          <Button 
            onClick={exportToCSV}
            variant="outline" 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white hover:text-white"
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
                  <TableHead className="text-slate-300 min-w-[150px]">Criativo</TableHead>
                  <TableHead className="text-slate-300 min-w-[120px]">Campanha</TableHead>
                  <TableHead className="text-slate-300 min-w-[140px]">Período</TableHead>
                  <TableHead className="text-slate-300 min-w-[100px]">Valor Gasto</TableHead>
                  <TableHead className="text-slate-300">Views 3s</TableHead>
                  <TableHead className="text-slate-300">Views 75%</TableHead>
                  <TableHead className="text-slate-300">Views Total</TableHead>
                  <TableHead className="text-slate-300">PR Hook %</TableHead>
                  <TableHead className="text-slate-300">Hook Rate %</TableHead>
                  <TableHead className="text-slate-300">Body Rate %</TableHead>
                  <TableHead className="text-slate-300">CTA %</TableHead>
                  <TableHead className="text-slate-300">CTR %</TableHead>
                  <TableHead className="text-slate-300">Conv. Body %</TableHead>
                  <TableHead className="text-slate-300">Qtd Vendas</TableHead>
                  <TableHead className="text-slate-300">Vendas Bruto</TableHead>
                  <TableHead className="text-slate-300">Lucro</TableHead>
                  <TableHead className="text-slate-300">CPA</TableHead>
                  <TableHead className="text-slate-300">ROI %</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center text-slate-400 py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : displayedCreatives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center text-slate-400 py-8">
                      Nenhum criativo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedCreatives.map((creative) => (
                    <TableRow key={creative.id} className="border-slate-700 hover:bg-slate-800/50">
                      <TableCell className="text-white font-medium">
                        {creative.creative_name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.campaign_name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.start_date} - {creative.end_date}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        R$ {creative.amount_spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.views_3s.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.views_75_percent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.views_total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.pr_hook_rate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.hook_rate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.body_rate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.cta_rate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.ctr.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.conv_body_rate.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.sales_count}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        R$ {creative.gross_sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className={`${creative.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        R$ {creative.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        R$ {creative.cpa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className={`${creative.roi >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                        {creative.roi.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={
                            creative.status === 'active' 
                              ? "bg-green-500/20 text-green-400" 
                              : creative.status === 'paused'
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {creative.status}
                        </Badge>
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
