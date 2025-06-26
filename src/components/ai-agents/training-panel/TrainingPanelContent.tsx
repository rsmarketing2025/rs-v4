
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneralTab } from "./GeneralTab";
import { TrainingTab } from "./TrainingTab";
import { BehaviorTab } from "./BehaviorTab";
import { ConversationFlowTab } from "./ConversationFlowTab";

interface TrainingPanelContentProps {
  formData: any;
  updateFormData: (section: string, data: any) => void;
  isMinimal?: boolean;
}

export const TrainingPanelContent: React.FC<TrainingPanelContentProps> = ({
  formData,
  updateFormData,
  isMinimal = false
}) => {
  const contentPadding = isMinimal ? "p-4" : "px-6 py-6";
  const spaceY = isMinimal ? "space-y-4" : "space-y-6";

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className={contentPadding}>
          <TabsContent value="general" className={`mt-0 ${spaceY}`}>
            <GeneralTab 
              data={formData.general}
              onChange={(data) => updateFormData('general', data)}
            />
          </TabsContent>

          <TabsContent value="training" className={`mt-0 ${spaceY}`}>
            <TrainingTab 
              data={formData.training}
              onChange={(data) => updateFormData('training', data)}
            />
          </TabsContent>

          <TabsContent value="behavior" className={`mt-0 ${spaceY}`}>
            <BehaviorTab 
              data={formData.behavior}
              onChange={(data) => updateFormData('behavior', data)}
            />
          </TabsContent>

          <TabsContent value="flow" className={`mt-0 ${spaceY}`}>
            <ConversationFlowTab 
              data={formData.conversationFlow}
              onChange={(data) => updateFormData('conversationFlow', data)}
            />
          </TabsContent>
        </div>
      </ScrollArea>
    </div>
  );
};
