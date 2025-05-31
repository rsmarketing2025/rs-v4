
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  icon: Icon,
  trend
}) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-5 h-5 text-slate-400" />
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              trend === 'up' && "bg-green-500/20 text-green-400 border-green-500/30",
              trend === 'down' && "bg-red-500/20 text-red-400 border-red-500/30",
              trend === 'neutral' && "bg-slate-500/20 text-slate-400 border-slate-500/30"
            )}
          >
            {change}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-slate-400">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};
