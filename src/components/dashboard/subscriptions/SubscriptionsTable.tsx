
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
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useSubscriptionEvents } from "@/hooks/useSubscriptionEvents";

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
  const pageSize = 20;
  
  const { events, loading, totalCount } = useSubscriptionEvents(
    dateRange, 
    filters, 
    page, 
    pageSize
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  const getEventTypeBadge = (eventType: string) => {
    if (eventType === 'subscription') {
      return <Badge className="bg-green-600 hover:bg-green-700">Nova Assinatura</Badge>;
    }
    return <Badge className="bg-red-600 hover:bg-red-700">Cancelamento</Badge>;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Carregando eventos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-400">
          Mostrando {events.length} de {totalCount} eventos
        </p>
        <Button variant="outline" size="sm" className="text-slate-300 border-slate-600">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader sticky={true}>
              <TableRow className="border-slate-700 hover:bg-slate-800/50">
                <TableHead className="text-slate-300">Cliente</TableHead>
                <TableHead className="text-slate-300">Evento</TableHead>
                <TableHead className="text-slate-300">Plano</TableHead>
                <TableHead className="text-slate-300">Valor</TableHead>
                <TableHead className="text-slate-300">Data</TableHead>
                <TableHead className="text-slate-300">Criativo</TableHead>
                <TableHead className="text-slate-300">Pagamento</TableHead>
                <TableHead className="text-slate-300">Localização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} className="border-slate-700 hover:bg-slate-800/30">
                  <TableCell className="text-white">
                    <div>
                      <div className="font-medium">{event.customer_name || 'N/A'}</div>
                      <div className="text-sm text-slate-400">{event.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getEventTypeBadge(event.event_type)}
                  </TableCell>
                  <TableCell>
                    {getPlanBadge(event.plan)}
                  </TableCell>
                  <TableCell className="text-white">
                    R$ {(event.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(event.event_date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <div className="max-w-32 truncate">
                      {event.creative_name || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {event.payment_method || 'N/A'}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {event.state ? `${event.state}, ${event.country}` : event.country || 'N/A'}
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
