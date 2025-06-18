
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  variant: 'default' | 'success' | 'warning' | 'info' | 'black' | 'orange' | 'purple';
}

const variantStyles = {
  default: "bg-slate-800/45 border-slate-700",
  success: "bg-green-900/25 border-green-800/50",
  warning: "bg-orange-900/25 border-orange-800/50", 
  info: "bg-blue-900/25 border-blue-800/50",
  black: "bg-black/55 border-gray-900",
  orange: "bg-orange-900/30 border-orange-700/60",
  purple: "bg-purple-900/30 border-purple-700/60"
};

const iconStyles = {
  default: "text-slate-400",
  success: "text-green-400",
  warning: "text-orange-400",
  info: "text-blue-400",
  black: "text-gray-200",
  orange: "text-orange-300",
  purple: "text-purple-300"
};

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  variant
}) => {
  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');
  
  return (
    <Card className={cn("border", variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-300">{title}</span>
          <Icon className={cn("w-5 h-5", iconStyles[variant])} />
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-white">
            {value}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={cn(
              "text-sm font-medium flex items-center",
              isPositive && "text-green-400",
              isNegative && "text-red-400",
              !isPositive && !isNegative && "text-slate-400"
            )}>
              {isPositive && "↗"}
              {isNegative && "↘"}
              {change}
            </span>
            <span className="text-xs text-slate-500">vs período anterior</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
