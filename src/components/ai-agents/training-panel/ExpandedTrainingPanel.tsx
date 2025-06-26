
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { TrainingPanelHeader } from "./TrainingPanelHeader";
import { TrainingPanelTabs } from "./TrainingPanelTabs";
import { TrainingPanelContent } from "./TrainingPanelContent";
import { useAgentTrainingForm } from "@/hooks/useAgentTrainingForm";

interface ExpandedTrainingPanelProps {
  className?: string;
  onToggleExpanded?: () => void;
  isMinimal?: boolean;
}

export const ExpandedTrainingPanel: React.FC<ExpandedTrainingPanelProps> = ({
  className,
  onToggleExpanded,
  isMinimal = false
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const { formData, updateFormData, saveAsDraft } = useAgentTrainingForm();

  const containerHeight = isMinimal ? "h-80" : "h-full";

  return (
    <div className={`${isMinimal ? 'mb-4' : ''} ${className}`}>
      <Card className={`bg-neutral-950 border-neutral-800 ${containerHeight} flex flex-col shadow-2xl`}>
        <TrainingPanelHeader 
          isMinimal={isMinimal}
          onToggleExpanded={onToggleExpanded}
          onSaveAsDraft={saveAsDraft}
        />
        
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TrainingPanelTabs isMinimal={isMinimal} />
            <TrainingPanelContent 
              formData={formData}
              updateFormData={updateFormData}
              isMinimal={isMinimal}
            />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
