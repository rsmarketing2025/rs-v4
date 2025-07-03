
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SubscriptionsPaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const SubscriptionsPagination: React.FC<SubscriptionsPaginationProps> = ({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange
}) => {
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalCount / pageSize);
  const isShowingAll = pageSize === -1;

  const startItem = isShowingAll ? 1 : (currentPage - 1) * pageSize + 1;
  const endItem = isShowingAll ? totalCount : Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>Mostrando</span>
        <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
          <SelectTrigger className="w-20 bg-slate-800 border-slate-600 text-white h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="10" className="text-white hover:bg-slate-700">10</SelectItem>
            <SelectItem value="20" className="text-white hover:bg-slate-700">20</SelectItem>
            <SelectItem value="50" className="text-white hover:bg-slate-700">50</SelectItem>
            <SelectItem value="100" className="text-white hover:bg-slate-700">100</SelectItem>
            <SelectItem value="-1" className="text-white hover:bg-slate-700">Todos</SelectItem>
          </SelectContent>
        </Select>
        <span>
          {startItem} a {endItem} de {totalCount} registros
        </span>
      </div>

      {!isShowingAll && totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 p-0 ${
                    currentPage === pageNum
                      ? "bg-slate-600 text-white"
                      : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
