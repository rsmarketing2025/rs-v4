
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useSubscriptionStatusData } from "@/hooks/useSubscriptionStatusData";

interface SubscriptionsTableProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: {
    plan: string;
    eventType: string;
    paymentMethod: string;
  };
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({
  dateRange,
  filters
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const { subscriptions, loading, totalCount } = useSubscriptionStatusData(
    dateRange, 
    filters, 
    page, 
    pageSize
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusBadge = (status: string) => {
    if (status === 'Ativo') {
      return <Badge className="bg-green-600 hover:bg-green-700">Ativo</Badge>;
    }
    return <Badge className="bg-red-600 hover:bg-red-700">Cancelado</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      basic: "bg-blue-600 hover:bg-blue-700",
      premium: "bg-purple-600 hover:bg-purple-700", 
      enterprise: "bg-orange-600 hover:bg-orange-700"
    };
    return (
      <Badge className={colors[plan as keyof typeof colors] || "bg-gray-600"}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setPage(1); // Reset to first page when changing page size
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Carregando assinaturas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-400">
            Mostrando {subscriptions.length} de {totalCount} assinaturas
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Linhas por página:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="10" className="text-white hover:bg-slate-700">10</SelectItem>
                <SelectItem value="20" className="text-white hover:bg-slate-700">20</SelectItem>
                <SelectItem value="50" className="text-white hover:bg-slate-700">50</SelectItem>
                <SelectItem value="100" className="text-white hover:bg-slate-700">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-slate-300 border-slate-600">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-800/50">
                <TableHead className="text-slate-300">Cliente</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Plano</TableHead>
                <TableHead className="text-slate-300">Valor</TableHead>
                <TableHead className="text-slate-300">Data Criação</TableHead>
                <TableHead className="text-slate-300">Número</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id} className="border-slate-700 hover:bg-slate-800/30">
                  <TableCell className="text-white">
                    <div>
                      <div className="font-medium">{subscription.customer_name || 'N/A'}</div>
                      <div className="text-sm text-slate-400">{subscription.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(subscription.subscription_status)}
                  </TableCell>
                  <TableCell>
                    {getPlanBadge(subscription.plan)}
                  </TableCell>
                  <TableCell className="text-white">
                    R$ {(subscription.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {subscription.subscription_number || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Página {page} de {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-slate-300 border-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-slate-300 border-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
