
import React from 'react';
import { Package, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import { useProductSalesMetrics } from "@/hooks/useProductSalesMetrics";
import { MetricsCard } from "@/components/dashboard/MetricsCard";

interface ProductSalesSummaryCardsProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: {
    product: string;
    eventType: string;
    paymentMethod: string;
    status: string;
  };
}

export const ProductSalesSummaryCards: React.FC<ProductSalesSummaryCardsProps> = ({
  dateRange,
  filters
}) => {
  const { metrics, loading } = useProductSalesMetrics(dateRange, filters);

  console.log('🎯 [PRODUCT SUMMARY CARDS] Rendering with metrics:', {
    loading,
    metrics
  });

  const cards = [
    {
      title: "Total de Produtos",
      value: loading ? "..." : metrics.totalProducts.toLocaleString(),
      change: loading ? "..." : `+${metrics.productsGrowth.toFixed(1)}%`,
      icon: Package,
      variant: 'purple' as const
    },
    {
      title: "Receita Total",
      value: loading ? "..." : `R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: loading ? "..." : `+${metrics.revenueGrowth.toFixed(1)}%`,
      icon: DollarSign,
      variant: 'black' as const
    },
    {
      title: "Ticket Médio",
      value: loading ? "..." : `R$ ${metrics.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: loading ? "..." : `+${metrics.avgTicketGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      variant: 'orange' as const
    },
    {
      title: "Total de Pedidos",
      value: loading ? "..." : metrics.totalOrders.toLocaleString(),
      change: loading ? "..." : `+${metrics.ordersGrowth.toFixed(1)}%`,
      icon: ShoppingCart,
      variant: 'success' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, index) => (
        <MetricsCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          icon={card.icon}
          variant={card.variant}
        />
      ))}
    </div>
  );
};
