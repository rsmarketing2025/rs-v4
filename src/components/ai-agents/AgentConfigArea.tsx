
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneralTab } from "./config-tabs/GeneralTab";
import { TrainingTab } from "./config-tabs/TrainingTab";
import { BehaviorTab } from "./config-tabs/BehaviorTab";
import { ConversationFlowTab } from "./config-tabs/ConversationFlowTab";

export const AgentConfigArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 bg-neutral-950 border-neutral-800 flex flex-col overflow-hidden min-h-0">
        <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 min-h-0">
            <div className="border-b border-neutral-800 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-4 bg-neutral-900 rounded-none h-12">
                <TabsTrigger value="general" className="text-sm">
                  Geral
                </TabsTrigger>
                <TabsTrigger value="training" className="text-sm">
                  Treinamento
                </TabsTrigger>
                <TabsTrigger value="behavior" className="text-sm">
                  Comportamento
                </TabsTrigger>
                <TabsTrigger value="flow" className="text-sm">
                  Fluxo
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <TabsContent value="general" className="mt-0 h-full">
                    <GeneralTab />
                  </TabsContent>

                  <TabsContent value="training" className="mt-0 h-full">
                    <TrainingTab />
                  </TabsContent>

                  <TabsContent value="behavior" className="mt-0 h-full">
                    <BehaviorTab />
                  </TabsContent>

                  <TabsContent value="flow" className="mt-0 h-full">
                    <ConversationFlowTab />
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
