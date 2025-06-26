
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Upload, Brain, GitBranch } from "lucide-react";

interface TrainingPanelTabsProps {
  isMinimal?: boolean;
}

export const TrainingPanelTabs: React.FC<TrainingPanelTabsProps> = ({ isMinimal = false }) => {
  const tabClass = isMinimal 
    ? "flex items-center gap-2 text-sm"
    : "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-neutral-700";

  const tabsListClass = isMinimal
    ? "grid grid-cols-4 bg-neutral-900 rounded-none border-b border-neutral-800 flex-shrink-0 w-full"
    : "grid grid-cols-4 bg-neutral-900 rounded-none border-b border-neutral-800 flex-shrink-0 w-full p-1";

  return (
    <TabsList className={tabsListClass}>
      <TabsTrigger value="general" className={tabClass}>
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Geral</span>
      </TabsTrigger>
      <TabsTrigger value="training" className={tabClass}>
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Treinamento</span>
      </TabsTrigger>
      <TabsTrigger value="behavior" className={tabClass}>
        <Brain className="w-4 h-4" />
        <span className="hidden sm:inline">Comportamento</span>
      </TabsTrigger>
      <TabsTrigger value="flow" className={tabClass}>
        <GitBranch className="w-4 h-4" />
        <span className="hidden sm:inline">Fluxo</span>
      </TabsTrigger>
    </TabsList>
  );
};
