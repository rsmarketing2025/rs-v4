
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface RegionalAnalysisProps {
  regionalMetrics: Record<string, { 
    orders: number; 
    revenue: number; 
    states: Record<string, { orders: number; revenue: number }> 
  }>;
}

export const RegionalAnalysis: React.FC<RegionalAnalysisProps> = ({ regionalMetrics }) => {
  if (Object.keys(regionalMetrics).length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Análise Regional
        </CardTitle>
        <CardDescription className="text-slate-400">
          Distribuição de vendas por região
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(regionalMetrics)
            .sort(([,a], [,b]) => b.revenue - a.revenue)
            .slice(0, 6)
            .map(([country, data]) => (
            <div key={country} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <h4 className="text-white font-medium mb-2">{country}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pedidos:</span>
                  <span className="text-white">{data.orders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Receita:</span>
                  <span className="text-green-400">
                    R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estados:</span>
                  <span className="text-white">{Object.keys(data.states).length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
