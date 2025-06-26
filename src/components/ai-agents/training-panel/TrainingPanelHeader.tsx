
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, ChevronUp } from "lucide-react";

interface TrainingPanelHeaderProps {
  isMinimal?: boolean;
  onToggleExpanded?: () => void;
  onSaveAsDraft: () => void;
}

export const TrainingPanelHeader: React.FC<TrainingPanelHeaderProps> = ({
  isMinimal = false,
  onToggleExpanded,
  onSaveAsDraft
}) => {
  if (isMinimal) {
    return (
      <CardHeader className="bg-neutral-900/50 border-b border-neutral-800 p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span className="text-base md:text-lg font-semibold truncate">Configuração do Agente</span>
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <Button
              onClick={onSaveAsDraft}
              variant="outline"
              size="sm"
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all duration-200 text-xs md:text-sm px-2 md:px-3"
            >
              <span className="hidden sm:inline">Salvar Rascunho</span>
              <span className="sm:hidden">Salvar</span>
            </Button>
            {onToggleExpanded && (
              <Button
                onClick={onToggleExpanded}
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-white p-2"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    );
  }

  return (
    <CardHeader className="bg-neutral-900/50 border-b border-neutral-800 p-4 md:px-6 md:py-5 flex-shrink-0">
      <div className="flex items-center justify-between">
        <CardTitle className="text-white flex items-center gap-3 min-w-0 flex-1">
          <Settings className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <span className="text-lg md:text-xl font-semibold truncate">Configuração do Agente</span>
        </CardTitle>
        
        <div className="flex items-center flex-shrink-0 ml-4">
          <Button
            onClick={onSaveAsDraft}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white px-3 md:px-4 py-2 transition-all duration-200 text-sm"
          >
            <span className="hidden md:inline">Salvar Rascunho</span>
            <span className="md:hidden">Salvar</span>
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
