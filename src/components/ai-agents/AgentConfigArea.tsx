
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { GeneralTab } from "./config-tabs/GeneralTab";
import { TrainingTab } from "./config-tabs/TrainingTab";
import { BehaviorTab } from "./config-tabs/BehaviorTab";
import { ConversationFlowTab } from "./config-tabs/ConversationFlowTab";
import { MonitoringTab } from "./config-tabs/MonitoringTab";

export const AgentConfigArea: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-4">
      {/* Header do painel - sempre visível */}
      <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-neutral-400" />
          <span className="text-sm font-medium text-white">Configuração do Agente</span>
        </div>
        <Button
          onClick={toggleExpanded}
          variant="ghost"
          size="sm"
          className="text-neutral-400 hover:text-white h-8 w-8 p-0"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Área expansível com as configurações */}
      {isExpanded && (
        <Card className="mt-2 bg-neutral-950 border-neutral-800 max-w-4xl mx-auto">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-neutral-800">
                <TabsList className="grid w-full grid-cols-5 bg-neutral-900 rounded-none">
                  <TabsTrigger value="general" className="text-xs">
                    Geral
                  </TabsTrigger>
                  <TabsTrigger value="training" className="text-xs">
                    Treinamento
                  </TabsTrigger>
                  <TabsTrigger value="behavior" className="text-xs">
                    Comportamento
                  </TabsTrigger>
                  <TabsTrigger value="flow" className="text-xs">
                    Fluxo
                  </TabsTrigger>
                  <TabsTrigger value="monitoring" className="text-xs">
                    Monitoramento
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="p-6">
                  <TabsContent value="general" className="mt-0">
                    <GeneralTab />
                  </TabsContent>

                  <TabsContent value="training" className="mt-0">
                    <TrainingTab />
                  </TabsContent>

                  <TabsContent value="behavior" className="mt-0">
                    <BehaviorTab />
                  </TabsContent>

                  <TabsContent value="flow" className="mt-0">
                    <ConversationFlowTab />
                  </TabsContent>

                  <TabsContent value="monitoring" className="mt-0">
                    <MonitoringTab />
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
