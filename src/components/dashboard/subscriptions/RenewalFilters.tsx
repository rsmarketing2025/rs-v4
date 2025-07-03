
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAvailableProducts } from "@/hooks/useAvailableProducts";

interface RenewalFiltersProps {
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

export const RenewalFilters: React.FC<RenewalFiltersProps> = ({
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange
}) => {
  const { products, loading: productsLoading } = useAvailableProducts();

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

  const handleProductSelect = (productName: string) => {
    const updatedProducts = filters.products.includes(productName)
      ? filters.products.filter(p => p !== productName)
      : [...filters.products, productName];
    
    onFiltersChange({
      ...filters,
      products: updatedProducts
    });
  };

  const handleSelectAllProducts = () => {
    if (filters.products.length === products.length) {
      // Deselect all
      onFiltersChange({
        ...filters,
        products: []
      });
    } else {
      // Select all
      onFiltersChange({
        ...filters,
        products: [...products]
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
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

        <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
          <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white text-xs md:text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white">Todos Status</SelectItem>
            <SelectItem value="active" className="text-white">Ativo</SelectItem>
            <SelectItem value="canceled" className="text-white">Cancelado</SelectItem>
            <SelectItem value="expired" className="text-white">Expirado</SelectItem>
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

      {/* Product Filter Section */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium text-sm">Filtrar por Produtos</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAllProducts}
            disabled={productsLoading}
            className="text-xs text-slate-300 hover:text-white h-6 px-2"
          >
            {filters.products.length === products.length ? 'Desmarcar todos' : 'Selecionar todos'}
          </Button>
        </div>

        {productsLoading ? (
          <div className="text-slate-400 text-xs">Carregando produtos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {products.map((product) => (
              <label
                key={product}
                className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700/50 rounded p-2 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.products.includes(product)}
                  onChange={() => handleProductSelect(product)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white text-xs truncate" title={product}>
                  {product}
                </span>
              </label>
            ))}
          </div>
        )}

        {filters.products.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-600">
            <div className="text-xs text-slate-300">
              {filters.products.length} produto(s) selecionado(s)
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.products.slice(0, 3).map((product) => (
                <span
                  key={product}
                  className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded"
                >
                  {product.length > 20 ? `${product.substring(0, 20)}...` : product}
                </span>
              ))}
              {filters.products.length > 3 && (
                <span className="inline-block bg-slate-600 text-white text-xs px-2 py-1 rounded">
                  +{filters.products.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
