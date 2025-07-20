
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download } from "lucide-react";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

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
  clicks: number;
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
  products: string[];
  tags: string[];
}

interface CreativesTableProps {
  creatives: CreativeMetrics[];
  filteredCreatives: CreativeMetrics[];
  loading: boolean;
  onExportCSV: () => void;
}

export const CreativesTable: React.FC<CreativesTableProps> = ({
  creatives,
  filteredCreatives,
  loading,
  onExportCSV
}) => {
  const displayedCreatives = filteredCreatives.slice(0, 50);

  const truncateText = (text: string, maxLength: number = 7) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <TooltipProvider>
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Performance Detalhada dos Criativos</CardTitle>
            <CardDescription className="text-slate-400">
              Mostrando {Math.min(displayedCreatives.length, 50)} de {filteredCreatives.length} criativos
            </CardDescription>
          </div>
          <PermissionWrapper requirePage="exports" fallback={
            <Button 
              onClick={() => alert('Sem permissão para exportar dados')}
              variant="outline" 
              size="sm"
              className="bg-slate-600 hover:bg-slate-700 border-slate-600 text-slate-400"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          }>
            <Button 
              onClick={onExportCSV}
              variant="outline" 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </PermissionWrapper>
        </CardHeader>
        <CardContent>
          <div className="w-full max-h-[600px] overflow-y-auto">
            <div className="overflow-x-auto">
              <div className="min-w-[2400px]">
                <Table>
                <TableHeader className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur-sm">
                  <TableRow className="border-slate-700">
                    {/* Priority Columns - Always Visible */}
                    <TableHead className="text-slate-300 w-[200px] min-w-[200px]">Criativo</TableHead>
                    <TableHead className="text-slate-300 w-[150px] min-w-[150px]">Campanha</TableHead>
                    <TableHead className="text-slate-300 w-[120px] min-w-[120px]">Valor Gasto</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">Views Total</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">CTR %</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">ROI</TableHead>
                    
                    {/* Secondary Columns - Horizontal Scroll */}
                    <TableHead className="text-slate-300 w-[120px] min-w-[120px]">Produtos</TableHead>
                    <TableHead className="text-slate-300 w-[120px] min-w-[120px]">Tags</TableHead>
                    <TableHead className="text-slate-300 w-[140px] min-w-[140px]">Período</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">Views 3s</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">Views 75%</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">Clicks</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">PR Hook %</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">Hook Rate %</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">Body Rate %</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">CTA %</TableHead>
                    <TableHead className="text-slate-300 w-[120px] min-w-[120px]">Conv. Body %</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">Qtd Vendas</TableHead>
                    <TableHead className="text-slate-300 w-[120px] min-w-[120px]">Vendas Bruto</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">Lucro</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">CPA</TableHead>
                    <TableHead className="text-slate-300 w-[100px] min-w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={22} className="text-center text-slate-400 py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : displayedCreatives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={22} className="text-center text-slate-400 py-8">
                      Nenhum criativo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedCreatives.map((creative) => (
                    <TableRow key={creative.id} className="border-slate-700 hover:bg-slate-800/50">
                      {/* Priority Columns - Always Visible */}
                      <TableCell className="text-white font-medium">
                        {creative.creative_name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.campaign_name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        R$ {creative.amount_spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.views_total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.ctr.toFixed(2)}%
                      </TableCell>
                      <TableCell className={`${creative.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {creative.roi.toFixed(2)}x
                      </TableCell>
                      
                      {/* Secondary Columns - Horizontal Scroll */}
                      <TableCell className="text-slate-300">
                        {creative.products && creative.products.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {creative.products.map((product, index) => (
                              <Tooltip key={index}>
                                <TooltipTrigger>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-help"
                                  >
                                    {truncateText(product)}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{product}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.tags && creative.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {creative.tags.map((tag, index) => (
                              <Tooltip key={index}>
                                <TooltipTrigger>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30 cursor-help"
                                  >
                                    {truncateText(tag)}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{tag}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.start_date} - {creative.end_date}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.views_3s.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.views_75_percent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {creative.clicks.toLocaleString()}
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
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
