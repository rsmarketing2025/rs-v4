
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, ChevronDown } from "lucide-react";

interface MinimalTrainingPanelProps {
  className?: string;
  onToggleExpanded: () => void;
}

export const MinimalTrainingPanel: React.FC<MinimalTrainingPanelProps> = ({
  className,
  onToggleExpanded
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <Card className="bg-neutral-950 border-neutral-800">
        <CardContent className="p-4">
          <Button
            onClick={onToggleExpanded}
            variant="ghost"
            className="w-full justify-between text-white hover:bg-neutral-800"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Configuração do Agente</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
