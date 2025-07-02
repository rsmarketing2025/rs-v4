
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useProductSalesChartData } from "@/hooks/useProductSalesChartData";
import { format } from 'date-fns';

interface ProductSalesTableProps {
  dateRange: { from: Date; to: Date };
  filters: { product: string; eventType: string; paymentMethod: string; status: string };
  searchTerm: string;
}

export const ProductSalesTable: React.FC<ProductSalesTableProps> = ({
  dateRange,
  filters,
  searchTerm
}) => {
  const { chartData, loading } = useProductSalesChartData(dateRange, true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data based on search term
  const filteredData = chartData.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      item.product_name?.toLowerCase().includes(searchLower) ||
      item.date?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getStatusBadge = (isSubscription: boolean) => {
    return isSubscription ? (
      <Badge variant="default" className="bg-blue-600">Assinatura</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-600">Produto</Badge>
    );
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Vendas de Produtos</CardTitle>
          <CardDescription className="text-slate-400">
            Lista detalhada de todas as vendas de produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="text-slate-400">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Vendas de Produtos</CardTitle>
        <CardDescription className="text-slate-400">
          Lista detalhada de todas as vendas de produtos ({filteredData.length} registros)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-slate-700">
          <Table stickyHeader>
            <TableHeader sticky>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Data</TableHead>
                <TableHead className="text-slate-300">Produto</TableHead>
                <TableHead className="text-slate-300">Receita</TableHead>
                <TableHead className="text-slate-300">Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item, index) => (
                <TableRow key={index} className="border-slate-700 hover:bg-slate-800/50">
                  <TableCell className="text-slate-200">
                    {format(new Date(item.date), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-slate-200 font-medium">
                    {item.product_name || 'N/A'}
                  </TableCell>
                  <TableCell className="text-slate-200">
                    R$ {(item.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-slate-200">
                    {getStatusBadge(true)} {/* Assuming subscription for now */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
