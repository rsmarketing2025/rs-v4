
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Área de Treinamento</h1>
          <p className="text-neutral-400 mt-2">
            Configure e treine seu AI Agent para fornecer respostas mais precisas
          </p>
        </div>
      </div>

      <Card className="bg-neutral-950 border-neutral-800">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-neutral-900">
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

              <TabsContent value="flows" className="space-y-6 mt-0">
                <ConversationFlows />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
