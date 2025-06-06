
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Repeat } from "lucide-react";
import { useCreativesData } from "@/hooks/useCreativesData";

interface SubscriptionsTabProps {
  dateRange: { from: Date; to: Date };
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({ dateRange }) => {
  const { creatives, loading } = useCreativesData(dateRange);

  // Filter creatives that have subscription-related tags
  const subscriptionCreatives = useMemo(() => {
    return creatives.filter(creative => 
      creative.tags.some(tag => 
        tag.toLowerCase().includes('assinatura') || 
        tag.toLowerCase().includes('subscription') ||
        tag.toLowerCase().includes('recorrente') ||
        tag.toLowerCase().includes('mensal')
      )
    );
  }, [creatives]);

  // Calculate subscription metrics
  const subscriptionMetrics = useMemo(() => {
    const totalSpent = subscriptionCreatives.reduce((sum, creative) => sum + creative.amount_spent, 0);
    const totalRevenue = subscriptionCreatives.reduce((sum, creative) => sum + creative.gross_sales, 0);
    const totalSales = subscriptionCreatives.reduce((sum, creative) => sum + creative.sales_count, 0);
    const totalProfit = subscriptionCreatives.reduce((sum, creative) => sum + creative.profit, 0);
    const avgROI = totalSpent > 0 ? totalRevenue / totalSpent : 0;

    return {
      totalSpent,
      totalRevenue,
      totalSales,
      totalProfit,
      avgROI
    };
  }, [subscriptionCreatives]);

  const exportToCSV = () => {
    const headers = [
      'Criativo', 'Campanha', 'Tags', 'Valor Gasto', 'Vendas Bruto', 'Qtd Vendas', 'Lucro', 'ROI'
    ];
    
    const csvData = [
      headers.join(','),
      ...subscriptionCreatives.map(creative => [
        `"${creative.creative_name}"`,
        `"${creative.campaign_name}"`,
        `"${creative.tags.join('; ')}"`,
        creative.amount_spent.toFixed(2),
        creative.gross_sales.toFixed(2),
        creative.sales_count,
        creative.profit.toFixed(2),
        creative.roi.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `assinaturas-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Repeat className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Total Assinaturas</p>
                <p className="text-xl font-bold text-white">
                  {subscriptionMetrics.totalSales.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-blue-400 rounded" />
              <div>
                <p className="text-sm text-slate-400">Valor Investido</p>
                <p className="text-xl font-bold text-white">
                  R$ {subscriptionMetrics.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-400 rounded" />
              <div>
                <p className="text-sm text-slate-400">Receita Total</p>
                <p className="text-xl font-bold text-white">
                  R$ {subscriptionMetrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-orange-400 rounded" />
              <div>
                <p className="text-sm text-slate-400">Lucro Total</p>
                <p className={`text-xl font-bold ${subscriptionMetrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  R$ {subscriptionMetrics.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-yellow-400 rounded" />
              <div>
                <p className="text-sm text-slate-400">ROI Médio</p>
                <p className="text-xl font-bold text-white">
                  {subscriptionMetrics.avgROI.toFixed(2)}x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Criativos com Assinaturas</CardTitle>
            <CardDescription className="text-slate-400">
              Criativos categorizados com tags relacionadas a assinaturas
            </CardDescription>
          </div>
          <Button 
            onClick={exportToCSV}
            variant="outline" 
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 border-purple-600 text-white hover:text-white"
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
                  <TableHead className="text-slate-300">Criativo</TableHead>
                  <TableHead className="text-slate-300">Campanha</TableHead>
                  <TableHead className="text-slate-300">Tags</TableHead>
                  <TableHead className="text-slate-300">Valor Gasto</TableHead>
                  <TableHead className="text-slate-300">Qtd Vendas</TableHead>
                  <TableHead className="text-slate-300">Receita</TableHead>
                  <TableHead className="text-slate-300">Lucro</TableHead>
                  <TableHead className="text-slate-300">ROI</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : subscriptionCreatives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                      Nenhum criativo com assinatura encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptionCreatives.map((creative) => (
                    <TableRow key={creative.id} className="border-slate-700 hover:bg-slate-800/50">
                      <TableCell className="text-white font-medium">
                        {creative.creative_name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.campaign_name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex flex-wrap gap-1">
                          {creative.tags.map((tag, index) => (
                            <Badge 
                              key={index}
                              variant="outline" 
                              className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        R$ {creative.amount_spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                      <TableCell className={`${creative.roi >= 1 ? 'text-green-400' : 'text-orange-400'}`}>
                        {creative.roi.toFixed(2)}x
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
