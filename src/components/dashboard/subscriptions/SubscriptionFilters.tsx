
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface SubscriptionFiltersProps {
  filters: {
    plan: string;
    eventType: string;
    paymentMethod: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const SubscriptionFilters: React.FC<SubscriptionFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const resetFilters = () => {
    onFiltersChange({
      plan: 'all',
      eventType: 'all',
      paymentMethod: 'all'
    });
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
      <Select
        value={filters.plan}
        onValueChange={(value) => onFiltersChange({ ...filters, plan: value })}
      >
        <SelectTrigger className="w-full sm:w-32 md:w-40 bg-slate-800 border-slate-700 text-white text-xs md:text-sm">
          <SelectValue placeholder="Plano" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          <SelectItem value="all">Todos os Planos</SelectItem>
          <SelectItem value="basic">Basic</SelectItem>
          <SelectItem value="premium">Premium</SelectItem>
          <SelectItem value="enterprise">Enterprise</SelectItem>
        </SelectContent>
      </Select>

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
