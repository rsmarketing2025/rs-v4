
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Upload, Brain, GitBranch } from "lucide-react";

interface TrainingPanelTabsProps {
  isMinimal?: boolean;
}

export const TrainingPanelTabs: React.FC<TrainingPanelTabsProps> = ({ isMinimal = false }) => {
  const tabClass = isMinimal 
    ? "flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 py-2 font-medium transition-all duration-200 hover:bg-neutral-700 data-[state=active]:bg-neutral-700 data-[state=active]:text-white rounded-md"
    : "flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 text-sm font-medium transition-all duration-200 hover:bg-neutral-700 data-[state=active]:bg-neutral-700 data-[state=active]:text-white rounded-md";

  const tabsListClass = isMinimal
    ? "grid grid-cols-4 bg-neutral-900 border-b border-neutral-800 flex-shrink-0 w-full p-1 gap-1"
    : "grid grid-cols-4 bg-neutral-900 border-b border-neutral-800 flex-shrink-0 w-full p-1 md:p-2 gap-1";

  return (
    <TabsList className={tabsListClass}>
      <TabsTrigger value="general" className={tabClass}>
        <Settings className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline">Geral</span>
        <span className="sm:hidden text-xs">G</span>
      </TabsTrigger>
      <TabsTrigger value="training" className={tabClass}>
        <Upload className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline">Treinamento</span>
        <span className="sm:hidden text-xs">T</span>
      </TabsTrigger>
      <TabsTrigger value="behavior" className={tabClass}>
        <Brain className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline">Comportamento</span>
        <span className="sm:hidden text-xs">C</span>
      </TabsTrigger>
      <TabsTrigger value="flow" className={tabClass}>
        <GitBranch className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline">Fluxo</span>
        <span className="sm:hidden text-xs">F</span>
      </TabsTrigger>
    </TabsList>
  );
};
