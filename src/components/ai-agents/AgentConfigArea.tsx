
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { GeneralTab, AGENT_ID } from "./config-tabs/GeneralTab";
import { InvisibleStructureTab } from "./config-tabs/InvisibleStructureTab";
import { AdsTab } from "./config-tabs/AdsTab";
import { ParadoxQuestionTab } from "./config-tabs/ParadoxQuestionTab";
import { LeadsTab } from "./config-tabs/LeadsTab";
import { BigIdeaTab } from "./config-tabs/BigIdeaTab";
import { StorytellingTab } from "./config-tabs/StorytellingTab";
import { OfferTab } from "./config-tabs/OfferTab";

export const AgentConfigArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 bg-neutral-950 border-neutral-800 flex flex-col overflow-hidden min-h-0">
        <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
          {/* Header com ID do Agente */}
          <div className="p-4 border-b border-neutral-800 flex-shrink-0 bg-neutral-900/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Configuração do Agente</h2>
                <p className="text-sm text-neutral-400">ID: {AGENT_ID}</p>
              </div>
              <Badge variant="outline" className="text-neutral-300 border-neutral-600">
                Copy Chief
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 min-h-0">
            <div className="border-b border-neutral-800 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-8 bg-neutral-900 rounded-none h-12">
                <TabsTrigger value="general" className="text-xs">
                  Geral
                </TabsTrigger>
                <TabsTrigger value="invisible-structure" className="text-xs">
                  Estrutura Invisível
                </TabsTrigger>
                <TabsTrigger value="ads" className="text-xs">
                  Anúncios
                </TabsTrigger>
                <TabsTrigger value="paradox-question" className="text-xs">
                  Pergunta Paradoxal
                </TabsTrigger>
                <TabsTrigger value="leads" className="text-xs">
                  Leads
                </TabsTrigger>
                <TabsTrigger value="big-idea" className="text-xs">
                  Big Idea
                </TabsTrigger>
                <TabsTrigger value="storytelling" className="text-xs">
                  Storytelling
                </TabsTrigger>
                <TabsTrigger value="offer" className="text-xs">
                  Oferta
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <TabsContent value="general" className="mt-0 h-full">
                    <GeneralTab />
                  </TabsContent>

                  <TabsContent value="invisible-structure" className="mt-0 h-full">
                    <InvisibleStructureTab />
                  </TabsContent>

                  <TabsContent value="ads" className="mt-0 h-full">
                    <AdsTab />
                  </TabsContent>

                  <TabsContent value="paradox-question" className="mt-0 h-full">
                    <ParadoxQuestionTab />
                  </TabsContent>

                  <TabsContent value="leads" className="mt-0 h-full">
                    <LeadsTab />
                  </TabsContent>

                  <TabsContent value="big-idea" className="mt-0 h-full">
                    <BigIdeaTab />
                  </TabsContent>

                  <TabsContent value="storytelling" className="mt-0 h-full">
                    <StorytellingTab />
                  </TabsContent>

                  <TabsContent value="offer" className="mt-0 h-full">
                    <OfferTab />
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
