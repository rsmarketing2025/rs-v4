
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Users } from 'lucide-react';
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
          <Button variant="outline" className="bg-slate-800/90 border-slate-600 text-white hover:bg-slate-700/90 rounded-xl">
            <Users className="w-4 h-4 mr-2" />
            Business Manager
            {selectedBMs.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-600 text-white rounded-full">
                {selectedBMs.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-96 bg-slate-800/95 backdrop-blur-sm border-slate-600 text-white p-0 rounded-xl z-50" 
          align="start"
        >
          <div className="p-4 space-y-4">
            {/* Header with selection info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-white text-sm font-medium">
                  {selectedBMs.length} selecionados
                </span>
              </div>
            </div>

            {/* Title and action buttons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">
                  Selecionar Business Managers ({uniqueBMs.length} disponíveis)
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-slate-300 hover:text-white hover:bg-slate-700/50 text-xs px-3 py-1"
                  >
                    Todos
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-slate-300 hover:text-white hover:bg-slate-700/50 text-xs px-3 py-1"
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              {/* Search Field */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar Business Managers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl focus:border-slate-500"
                />
              </div>
            </div>

            {/* Business Manager List */}
            <div className="max-h-64 overflow-y-auto space-y-1 bg-slate-900/30 rounded-xl p-3">
              {filteredBMs.length === 0 ? (
                <div className="text-slate-400 text-center py-6">
                  Nenhum Business Manager encontrado
                </div>
              ) : (
                filteredBMs.map((bmName, index) => (
                  <div
                    key={bmName}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() => handleBMToggle(bmName)}
                  >
                    <Checkbox
                      id={bmName}
                      checked={selectedBMs.includes(bmName)}
                      onChange={() => handleBMToggle(bmName)}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-slate-500 rounded"
                    />
                    <label
                      htmlFor={bmName}
                      className="text-sm text-white cursor-pointer flex-1 font-medium"
                    >
                      {bmName}
                    </label>
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 60%)` 
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selected Filters Display */}
      {selectedBMs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedBMs.map((bmName, index) => (
            <Badge
              key={bmName}
              variant="secondary"
              className="bg-slate-800/90 border border-slate-600 text-white hover:bg-slate-700/90 rounded-xl px-3 py-1 flex items-center gap-2"
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: `hsl(${(uniqueBMs.indexOf(bmName) * 137.5) % 360}, 70%, 60%)` 
                }}
              />
              {bmName}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBMToggle(bmName)}
                className="ml-1 h-auto p-0 text-white hover:bg-slate-600/50 w-4 h-4 rounded-full"
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
