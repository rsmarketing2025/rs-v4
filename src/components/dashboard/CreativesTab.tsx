
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, MousePointer, TrendingUp, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreativePerformanceChart } from "./CreativePerformanceChart";

interface Creative {
  id: string;
  creative_name: string;
  campaign_name: string;
  amount_spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  views_3s: number;
  views_75_percent: number;
  hook_rate: number;
  body_rate: number;
  cta_rate: number;
  status: string;
  date_reported: string;
}

interface CreativesTabProps {
  dateRange: { from: Date; to: Date };
}

export const CreativesTab: React.FC<CreativesTabProps> = ({ dateRange }) => {
  const [creatives, setCreatives] = useState<Creative[]>([]);
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
      
      let query = supabase
        .from('creative_insights')
        .select('*');

      // Apply date filter
      if (dateRange.from && dateRange.to) {
        query = query
          .gte('date_reported', dateRange.from.toISOString())
          .lte('date_reported', dateRange.to.toISOString());
      }

      const { data, error } = await query.order('date_reported', { ascending: false });

      if (error) {
        throw error;
      }

      setCreatives(data || []);
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

  const totalMetrics = filteredCreatives.reduce((acc, creative) => ({
    spent: acc.spent + (creative.amount_spent || 0),
    impressions: acc.impressions + (creative.impressions || 0),
    clicks: acc.clicks + (creative.clicks || 0),
    views: acc.views + (creative.views_3s || 0),
  }), { spent: 0, impressions: 0, clicks: 0, views: 0 });

  const avgCTR = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Total Gasto</p>
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
                <p className="text-sm text-slate-400">Impressões</p>
                <p className="text-xl font-bold text-white">
                  {totalMetrics.impressions.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MousePointer className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Cliques</p>
                <p className="text-xl font-bold text-white">
                  {totalMetrics.clicks.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-slate-400">CTR Médio</p>
                <p className="text-xl font-bold text-white">
                  {avgCTR.toFixed(2)}%
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
        <CardHeader>
          <CardTitle className="text-white">Performance dos Criativos</CardTitle>
          <CardDescription className="text-slate-400">
            Análise detalhada de {filteredCreatives.length} criativos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Criativo</TableHead>
                  <TableHead className="text-slate-300">Campanha</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Gasto</TableHead>
                  <TableHead className="text-slate-300">Impressões</TableHead>
                  <TableHead className="text-slate-300">Cliques</TableHead>
                  <TableHead className="text-slate-300">CTR</TableHead>
                  <TableHead className="text-slate-300">Hook Rate</TableHead>
                  <TableHead className="text-slate-300">Body Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredCreatives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                      Nenhum criativo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCreatives.map((creative) => (
                    <TableRow key={creative.id} className="border-slate-700 hover:bg-slate-800/50">
                      <TableCell className="text-white font-medium">
                        {creative.creative_name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.campaign_name}
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
                      <TableCell className="text-slate-300">
                        R$ {(creative.amount_spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {(creative.impressions || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {(creative.clicks || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {(creative.ctr || 0).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {(creative.hook_rate || 0).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {(creative.body_rate || 0).toFixed(1)}%
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
