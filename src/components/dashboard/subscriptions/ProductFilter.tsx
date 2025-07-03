
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';

interface ProductFilterProps {
  selectedProduct: string;
  onProductChange: (product: string) => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  selectedProduct,
  onProductChange
}) => {
  const [products, setProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Buscar produtos únicos da tabela product_sales
        const { data: productSales, error: productError } = await supabase
          .from('product_sales')
          .select('product_name')
          .not('product_name', 'is', null);

        // Buscar planos únicos da tabela subscription_events
        const { data: subscriptionEvents, error: subscriptionError } = await supabase
          .from('subscription_events')
          .select('plan')
          .not('plan', 'is', null);

        if (productError || subscriptionError) {
          console.error('Error fetching products:', productError || subscriptionError);
          return;
        }

        // Combinar e remover duplicatas
        const allProducts = new Set<string>();
        
        productSales?.forEach(item => {
          if (item.product_name) {
            allProducts.add(item.product_name);
          }
        });

        subscriptionEvents?.forEach(item => {
          if (item.plan) {
            allProducts.add(item.plan);
          }
        });

        const uniqueProducts = Array.from(allProducts).sort();
        setProducts(uniqueProducts);

      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-300 text-sm font-medium">Filtrar por Produto:</span>
      <Select
        value={selectedProduct}
        onValueChange={onProductChange}
        disabled={loading}
      >
        <SelectTrigger className="w-60 bg-slate-800 border-slate-700 text-white">
          <SelectValue placeholder={loading ? "Carregando..." : "Selecione um produto"} />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
          <SelectItem value="all">Todos os Produtos</SelectItem>
          {products.map((product) => (
            <SelectItem key={product} value={product}>
              {product}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
