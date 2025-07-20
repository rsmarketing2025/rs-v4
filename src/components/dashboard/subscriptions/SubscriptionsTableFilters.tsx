
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportButton } from "@/components/ui/export-button";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

interface SubscriptionsTableFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onExportCSV: () => void;
}

export const SubscriptionsTableFilters: React.FC<SubscriptionsTableFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
  onExportCSV
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-300">Status:</label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
            <SelectValue placeholder="Selecionar status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="all" className="text-white hover:bg-slate-700">Todos</SelectItem>
            <SelectItem value="active" className="text-white hover:bg-slate-700">Ativo</SelectItem>
            <SelectItem value="canceled" className="text-white hover:bg-slate-700">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 flex justify-end">
        <PermissionWrapper requirePage="exports" fallback={
          <ExportButton 
            onClick={() => alert('Sem permissão para exportar dados')} 
            label="Exportar CSV"
          />
        }>
          <ExportButton onClick={onExportCSV} label="Exportar CSV" />
        </PermissionWrapper>
      </div>
    </div>
  );
};
