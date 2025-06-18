
import React from 'react';
import { LucideIcon } from "lucide-react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'info' | 'black' | 'orange' | 'purple';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon,
  trend,
  variant
}) => {
  const getVariant = () => {
    if (variant) return variant;
    if (trend === 'up') return 'success';
    if (trend === 'down') return 'warning';
    return 'default';
  };

  return (
    <MetricsCard
      title={title}
      value={value}
      change={change}
      icon={icon}
      variant={getVariant()}
    />
  );
};
