
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptionRenewals } from "@/hooks/useSubscriptionRenewals";

interface SubscriptionRenewalsTableProps {
  dateRange: { from: Date; to: Date };
  filters: { 
    plan: string; 
    eventType: string; 
    paymentMethod: string; 
    status: string; 
    products: string[];
  };
  searchTerm?: string;
}

export const SubscriptionRenewalsTable: React.FC<SubscriptionRenewalsTableProps> = ({
  dateRange,
  filters,
  searchTerm = ''
}) => {
  const { renewals, loading, totalCount } = useSubscriptionRenewals(
    dateRange,
    filters,
    searchTerm
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'canceled':
        return 'destructive';
      case 'suspended':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'canceled':
        return 'Cancelada';
      case 'suspended':
        return 'Suspensa';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Renovações de Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-slate-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">
          Renovações de Assinatura ({totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renewals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Nenhuma renovação encontrada para o período selecionado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Cliente</TableHead>
                <TableHead className="text-slate-300">Plano</TableHead>
                <TableHead className="text-slate-300">Valor</TableHead>
                <TableHead className="text-slate-300">Data</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Número</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renewals.map((renewal) => (
                <TableRow key={renewal.id} className="border-slate-700 hover:bg-slate-800/50">
                  <TableCell>
                    <div className="text-white">
                      <div className="font-medium">
                        {renewal.customer_name || 'N/A'}
                      </div>
                      <div className="text-sm text-slate-400">
                        {renewal.customer_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-slate-300 border-slate-600">
                      {renewal.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    R$ {renewal.amount?.toLocaleString('pt-BR', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(renewal.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(renewal.subscription_status)}>
                      {getStatusLabel(renewal.subscription_status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    #{renewal.subscription_number || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
