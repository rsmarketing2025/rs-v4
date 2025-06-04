
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, Users, Search } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar criativos baseado na busca
  const filteredCreatives = relevantCreatives.filter(creative =>
    creative.creative_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    filteredCreatives.forEach(creative => {
      if (!selectedCreatives.includes(creative.creative_name)) {
        onCreativeToggle(creative.creative_name);
      }
    });
  };

  const handleClearAll = () => {
    selectedCreatives.forEach(creativeName => {
      if (filteredCreatives.some(c => c.creative_name === creativeName)) {
        onCreativeToggle(creativeName);
      }
    });
  };

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
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-white text-sm font-medium">
                Selecionar Criativos ({relevantCreatives.length} disponíveis)
              </h4>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAll}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Todos
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearAll}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Limpar
                </Button>
              </div>
            </div>
            
            {/* Campo de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar criativos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
          </div>
          
          <ScrollArea className="h-64">
            <div className="p-3 space-y-2">
              {filteredCreatives.map((creative, index) => (
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
              {filteredCreatives.length === 0 && searchTerm && (
                <div className="text-center text-slate-400 py-4">
                  Nenhum criativo encontrado para "{searchTerm}"
                </div>
              )}
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
