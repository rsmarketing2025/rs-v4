
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search } from "lucide-react";

interface SubscriptionFiltersProps {
  filters: {
    plan?: string;
    product?: string;
    eventType: string;
    paymentMethod: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showProductFilter?: boolean;
}

export const SubscriptionFilters: React.FC<SubscriptionFiltersProps> = ({
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange,
  showProductFilter = false
}) => {
  const resetFilters = () => {
    const baseFilters = {
      eventType: 'all',
      paymentMethod: 'all',
      status: 'all'
    };
    
    if (showProductFilter) {
      onFiltersChange({ ...baseFilters, product: 'all' });
    } else {
      onFiltersChange({ ...baseFilters, plan: 'all' });
    }
    
    onSearchChange('');
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder={showProductFilter ? "Buscar por produto, ID..." : "Buscar por cliente, email ou ID..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-700 text-white text-xs md:text-sm"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-full sm:w-32 md:w-40 bg-slate-800 border-slate-700 text-white text-xs md:text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="canceled">Cancelados</SelectItem>
        </SelectContent>
      </Select>

      {showProductFilter && (
        <Select
          value={filters.product || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, product: value })}
        >
          <SelectTrigger className="w-full sm:w-32 md:w-40 bg-slate-800 border-slate-700 text-white text-xs md:text-sm">
            <SelectValue placeholder="Produto" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">Todos os Produtos</SelectItem>
            <SelectItem value="basic">Básico</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      )}

      {!showProductFilter && (
        <Select
          value={filters.eventType}
          onValueChange={(value) => onFiltersChange({ ...filters, eventType: value })}
        >
          <SelectTrigger className="w-full sm:w-32 md:w-40 bg-slate-800 border-slate-700 text-white text-xs md:text-sm">
            <SelectValue placeholder="Tipo de Evento" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">Todos os Eventos</SelectItem>
            <SelectItem value="subscription">Assinaturas</SelectItem>
            <SelectItem value="cancellation">Cancelamentos</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Select
        value={filters.paymentMethod}
        onValueChange={(value) => onFiltersChange({ ...filters, paymentMethod: value })}
      >
        <SelectTrigger className="w-full sm:w-32 md:w-40 bg-slate-800 border-slate-700 text-white text-xs md:text-sm">
          <SelectValue placeholder="Pagamento" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          <SelectItem value="all">Todos os Métodos</SelectItem>
          <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
          <SelectItem value="pix">PIX</SelectItem>
          <SelectItem value="boleto">Boleto</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={resetFilters}
        className="text-slate-300 border-slate-600 text-xs md:text-sm px-2 md:px-3"
      >
        <RotateCcw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
        Limpar
      </Button>
    </div>
  );
};
