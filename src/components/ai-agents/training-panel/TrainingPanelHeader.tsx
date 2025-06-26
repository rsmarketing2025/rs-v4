
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
            <Settings className="w-5 h-5 text-blue-400" />
            Configuração do Agente
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={onSaveAsDraft}
              variant="outline"
              size="sm"
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Salvar Rascunho
            </Button>
            {onToggleExpanded && (
              <Button
                onClick={onToggleExpanded}
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-white"
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
    <CardHeader className="bg-neutral-900/50 border-b border-neutral-800 px-6 py-5 flex-shrink-0">
      <div className="flex items-center justify-between">
        <CardTitle className="text-white flex items-center gap-3">
          <Settings className="w-5 h-5 text-blue-400" />
          <span className="text-xl font-semibold">Configuração do Agente</span>
        </CardTitle>
        
        <div className="flex items-center">
          <Button
            onClick={onSaveAsDraft}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white px-4 py-2 transition-all duration-200"
          >
            Salvar Rascunho
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
