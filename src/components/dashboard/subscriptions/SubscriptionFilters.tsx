
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { useAvailableProducts } from "@/hooks/useAvailableProducts";

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
  // Fetch available products dynamically
  const { products: availableProducts, loading: productsLoading } = useAvailableProducts();

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

  const handleProductChange = (product: string, checked: boolean) => {
    const updatedProducts = checked
      ? [...filters.products, product]
      : filters.products.filter(p => p !== product);
    
    onFiltersChange({ ...filters, products: updatedProducts });
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

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-slate-300 border-slate-600 text-xs md:text-sm px-2 md:px-3"
            disabled={productsLoading}
          >
            {productsLoading ? 'Carregando...' : `Produtos (${filters.products.length})`}
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 bg-slate-800 border-slate-700 p-3">
          <div className="space-y-2">
            <div className="font-medium text-white text-sm">Filtrar por Produtos</div>
            {productsLoading ? (
              <div className="text-slate-400 text-sm text-center py-4">
                Carregando produtos...
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-4">
                Nenhum produto encontrado
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableProducts.map((product) => (
                  <div key={product} className="flex items-center space-x-2">
                    <Checkbox
                      id={product}
                      checked={filters.products.includes(product)}
                      onCheckedChange={(checked) => handleProductChange(product, checked as boolean)}
                      className="border-slate-600 data-[state=checked]:bg-blue-600"
                    />
                    <label
                      htmlFor={product}
                      className="text-sm text-slate-300 cursor-pointer flex-1"
                    >
                      {product}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {filters.products.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange({ ...filters, products: [] })}
                className="w-full text-xs text-slate-300 border-slate-600"
              >
                Limpar Seleção
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

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
