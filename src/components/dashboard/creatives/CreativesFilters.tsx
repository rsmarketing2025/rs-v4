
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface CreativesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  showZeroValues: boolean;
  onShowZeroValuesChange: (value: boolean) => void;
}

export const CreativesFilters: React.FC<CreativesFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  showZeroValues,
  onShowZeroValuesChange
}) => {
  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros e Busca
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar criativos ou campanhas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-600 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full lg:w-[200px] bg-slate-900/50 border-slate-600 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={showZeroValues ? "default" : "outline"}
            onClick={() => onShowZeroValuesChange(!showZeroValues)}
            className="whitespace-nowrap"
          >
            {showZeroValues ? "Ocultar Zerados" : "Mostrar Zerados"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
