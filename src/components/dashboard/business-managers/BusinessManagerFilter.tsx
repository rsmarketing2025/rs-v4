
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BusinessManagerFilterProps {
  businessManagers: Array<{ id: string; bm_name: string; }>;
  selectedBMs: string[];
  onFilterChange: (selectedBMs: string[]) => void;
}

export const BusinessManagerFilter: React.FC<BusinessManagerFilterProps> = ({
  businessManagers,
  selectedBMs,
  onFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Get unique business manager names
  const uniqueBMs = Array.from(
    new Set(businessManagers.map(bm => bm.bm_name))
  ).sort();

  // Filter BMs based on search term
  const filteredBMs = uniqueBMs.filter(bmName =>
    bmName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBMToggle = (bmName: string) => {
    const newSelectedBMs = selectedBMs.includes(bmName)
      ? selectedBMs.filter(name => name !== bmName)
      : [...selectedBMs, bmName];
    
    onFilterChange(newSelectedBMs);
  };

  const handleClearAll = () => {
    onFilterChange([]);
    setSearchTerm('');
  };

  const handleSelectAll = () => {
    onFilterChange(filteredBMs);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
            <Filter className="w-4 h-4 mr-2" />
            Business Manager
            {selectedBMs.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                {selectedBMs.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-80 bg-slate-800 border-slate-700 text-white p-0" 
          align="start"
        >
          <div className="p-4 space-y-4">
            {/* Search Field */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar Business Manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Selecionar Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Limpar
              </Button>
            </div>

            {/* Business Manager List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredBMs.length === 0 ? (
                <div className="text-slate-400 text-center py-4">
                  Nenhum Business Manager encontrado
                </div>
              ) : (
                filteredBMs.map((bmName) => (
                  <div
                    key={bmName}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-slate-700 cursor-pointer"
                    onClick={() => handleBMToggle(bmName)}
                  >
                    <Checkbox
                      id={bmName}
                      checked={selectedBMs.includes(bmName)}
                      onChange={() => handleBMToggle(bmName)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label
                      htmlFor={bmName}
                      className="text-sm text-white cursor-pointer flex-1"
                    >
                      {bmName}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selected Filters Display */}
      {selectedBMs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedBMs.map((bmName) => (
            <Badge
              key={bmName}
              variant="secondary"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {bmName}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBMToggle(bmName)}
                className="ml-1 h-auto p-0 text-white hover:bg-blue-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
