
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneralSettings } from "./GeneralSettings";
import { TrainingFiles } from "./TrainingFiles";
import { ReferenceLinks } from "./ReferenceLinks";
import { ManualContexts } from "./ManualContexts";
import { BehaviorSettings } from "./BehaviorSettings";
import { ConversationFlows } from "./ConversationFlows";
import { 
  Settings, 
  Upload, 
  Link, 
  FileText, 
  Brain, 
  GitBranch 
} from "lucide-react";

export const AgentTrainingArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Card className="bg-neutral-950 border-neutral-800 h-full flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-6 bg-neutral-900 flex-shrink-0">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Arquivos
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="contexts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Contextos
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Comportamento
            </TabsTrigger>
            <TabsTrigger value="flows" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Fluxos
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <TabsContent value="general" className="space-y-6 mt-0">
                  <GeneralSettings />
                </TabsContent>

                <TabsContent value="files" className="space-y-6 mt-0">
                  <TrainingFiles />
                </TabsContent>

                <TabsContent value="links" className="space-y-6 mt-0">
                  <ReferenceLinks />
                </TabsContent>

                <TabsContent value="contexts" className="space-y-6 mt-0">
                  <ManualContexts />
                </TabsContent>

                <TabsContent value="behavior" className="space-y-6 mt-0">
                  <BehaviorSettings />
                </TabsContent>

                <TabsContent value="flows" className="space-y-6 mt-0 h-full">
                  <div className="h-[calc(100vh-200px)]">
                    <ConversationFlows />
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
