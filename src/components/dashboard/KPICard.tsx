
import React from 'react';
import { LucideIcon } from "lucide-react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon,
  trend
}) => {
  const getVariant = () => {
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
