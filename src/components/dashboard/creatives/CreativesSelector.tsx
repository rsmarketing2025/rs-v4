
import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Users } from "lucide-react";

interface CreativeData {
  creative_name: string;
  amount_spent: number;
  sales_count: number;
  roi: number;
  profit: number;
  gross_sales: number;
  views_3s: number;
  ctr: number;
  conv_body_rate: number;
  start_date: string;
  end_date: string;
}

interface CreativesSelectorProps {
  relevantCreatives: CreativeData[];
  selectedCreatives: string[];
  onCreativeToggle: (creativeName: string) => void;
  currentMetric: { value: string; label: string; color: string };
  colors: string[];
}

export const CreativesSelector: React.FC<CreativesSelectorProps> = ({
  relevantCreatives,
  selectedCreatives,
  onCreativeToggle,
  currentMetric,
  colors
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-white text-sm font-medium">
          Seleção de Criativos
        </h4>
        <Badge variant="secondary" className="bg-slate-700 text-slate-300">
          {currentMetric.label}
        </Badge>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between bg-slate-900/50 border-slate-600 text-white hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                {selectedCreatives.length === 0 
                  ? "Nenhum criativo selecionado"
                  : `${selectedCreatives.length} criativo${selectedCreatives.length !== 1 ? 's' : ''} selecionado${selectedCreatives.length !== 1 ? 's' : ''}`
                }
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-slate-900 border-slate-700" align="start">
          <div className="p-3 border-b border-slate-700">
            <h4 className="text-white text-sm font-medium">
              Selecionar Criativos ({relevantCreatives.length} disponíveis)
            </h4>
          </div>
          <ScrollArea className="h-64">
            <div className="p-3 space-y-2">
              {relevantCreatives.map((creative, index) => (
                <div key={creative.creative_name} className="flex items-center space-x-2">
                  <Checkbox
                    id={creative.creative_name}
                    checked={selectedCreatives.includes(creative.creative_name)}
                    onCheckedChange={() => onCreativeToggle(creative.creative_name)}
                    className="border-slate-500"
                  />
                  <label
                    htmlFor={creative.creative_name}
                    className="text-sm text-slate-300 cursor-pointer truncate flex-1"
                    title={creative.creative_name}
                  >
                    {creative.creative_name.length > 35 
                      ? creative.creative_name.substring(0, 35) + '...' 
                      : creative.creative_name}
                  </label>
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                </div>
              ))}
              {relevantCreatives.length === 0 && (
                <div className="text-center text-slate-400 py-4">
                  Nenhum criativo disponível para esta métrica
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
