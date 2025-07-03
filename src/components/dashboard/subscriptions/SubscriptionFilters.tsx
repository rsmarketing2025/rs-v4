
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search } from "lucide-react";

interface SubscriptionFiltersProps {
  filters: {
    plan: string;
    eventType: string;
    paymentMethod: string;
    status: string;
    products: string[];
  };
  onFiltersChange: (filters: any) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const SubscriptionFilters: React.FC<SubscriptionFiltersProps> = ({
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange
}) => {
  const resetFilters = () => {
    onFiltersChange({
      plan: 'all',
      eventType: 'all',
      paymentMethod: 'all',
      status: 'all',
      products: []
    });
    onSearchChange('');
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Buscar por cliente, email ou ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-700 text-white text-xs md:text-sm"
        />
      </div>

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
