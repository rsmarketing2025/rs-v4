
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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

interface SalesTableProps {
  sales: Sale[];
  filteredSales: Sale[];
  loading: boolean;
  onExportCSV: () => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  filteredSales,
  loading,
  onExportCSV
}) => {
  const displayedSales = filteredSales.slice(0, 20);

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

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Histórico de Vendas</CardTitle>
          <CardDescription className="text-slate-400">
            Mostrando {Math.min(displayedSales.length, 20)} de {filteredSales.length} vendas
          </CardDescription>
        </div>
        <Button 
          onClick={onExportCSV}
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
            <TableHeader sticky={true}>
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
  );
};
