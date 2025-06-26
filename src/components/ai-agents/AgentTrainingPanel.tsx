
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  Upload, 
  Brain, 
  GitBranch
} from "lucide-react";
import { GeneralTab } from "./training-panel/GeneralTab";
import { TrainingTab } from "./training-panel/TrainingTab";
import { BehaviorTab } from "./training-panel/BehaviorTab";
import { ConversationFlowTab } from "./training-panel/ConversationFlowTab";

interface AgentTrainingPanelProps {
  className?: string;
  isMinimal?: boolean;
}

export const AgentTrainingPanel: React.FC<AgentTrainingPanelProps> = ({ className, isMinimal = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Estados para armazenar dados do formulário (preparado para integração futura)
  const [formData, setFormData] = useState({
    general: {
      agentName: '',
      description: '',
      defaultLanguage: 'pt-BR',
      voiceTone: 'profissional'
    },
    training: {
      uploadedFiles: [],
      referenceLinks: [],
      manualContext: '',
      knowledgeBase: null
    },
    behavior: {
      forbiddenWords: [],
      defaultResponses: [],
      fallbackMessage: '',
      goodResponseExamples: [],
      responseLimit: 500
    },
    conversationFlow: {
      preDefinedFlows: [],
      conditions: [],
      escalationRules: []
    }
  });

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }));
  };

  const saveAsDraft = () => {
    localStorage.setItem('agentTrainingDraft', JSON.stringify(formData));
    console.log('Rascunho salvo localmente:', formData);
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('agentTrainingDraft');
    if (draft) {
      setFormData(JSON.parse(draft));
      console.log('Rascunho carregado:', JSON.parse(draft));
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  React.useEffect(() => {
    // Carregar rascunho ao montar o componente
    loadDraft();
  }, []);

  // Se não for minimal, renderiza o painel completo
  if (!isMinimal) {
    return (
      <div className={`${className} h-full flex flex-col`}>
        <Card className="bg-neutral-950 border-neutral-800 h-full flex flex-col">
          <CardHeader className="bg-neutral-900/50 border-b border-neutral-800 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Configuração do Agente
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={saveAsDraft}
                  variant="outline"
                  size="sm"
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  Salvar Rascunho
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className="grid grid-cols-4 bg-neutral-900 rounded-none border-b border-neutral-800 flex-shrink-0 w-full">
                <TabsTrigger value="general" className="flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Geral</span>
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center gap-2 text-sm">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Treinamento</span>
                </TabsTrigger>
                <TabsTrigger value="behavior" className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Comportamento</span>
                </TabsTrigger>
                <TabsTrigger value="flow" className="flex items-center gap-2 text-sm">
                  <GitBranch className="w-4 h-4" />
                  <span className="hidden sm:inline">Fluxo</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 sm:p-6">
                    <TabsContent value="general" className="mt-0 space-y-4">
                      <GeneralTab 
                        data={formData.general}
                        onChange={(data) => updateFormData('general', data)}
                      />
                    </TabsContent>

                    <TabsContent value="training" className="mt-0 space-y-4">
                      <TrainingTab 
                        data={formData.training}
                        onChange={(data) => updateFormData('training', data)}
                      />
                    </TabsContent>

                    <TabsContent value="behavior" className="mt-0 space-y-4">
                      <BehaviorTab 
                        data={formData.behavior}
                        onChange={(data) => updateFormData('behavior', data)}
                      />
                    </TabsContent>

                    <TabsContent value="flow" className="mt-0 space-y-4">
                      <ConversationFlowTab 
                        data={formData.conversationFlow}
                        onChange={(data) => updateFormData('conversationFlow', data)}
                      />
                    </TabsContent>
                  </div>
                </ScrollArea>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Versão minimal para usar em outras situações (se necessário no futuro)
  if (!isExpanded) {
    return (
      <div className={`mb-4 ${className}`}>
        <Card className="bg-neutral-950 border-neutral-800">
          <CardContent className="p-4">
            <Button
              onClick={toggleExpanded}
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
  }

  return (
    <div className={`mb-4 ${className}`}>
      <Card className="bg-neutral-950 border-neutral-800">
        <CardHeader className="bg-neutral-900/50 border-b border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Configuração do Agente
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={saveAsDraft}
                variant="outline"
                size="sm"
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Salvar Rascunho
              </Button>
              <Button
                onClick={toggleExpanded}
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-white"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="h-80">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className="grid grid-cols-4 bg-neutral-900 rounded-none border-b border-neutral-800 flex-shrink-0 w-full">
                <TabsTrigger value="general" className="flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Geral</span>
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center gap-2 text-sm">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Treinamento</span>
                </TabsTrigger>
                <TabsTrigger value="behavior" className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Comportamento</span>
                </TabsTrigger>
                <TabsTrigger value="flow" className="flex items-center gap-2 text-sm">
                  <GitBranch className="w-4 h-4" />
                  <span className="hidden sm:inline">Fluxo</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <TabsContent value="general" className="mt-0 space-y-4">
                      <GeneralTab 
                        data={formData.general}
                        onChange={(data) => updateFormData('general', data)}
                      />
                    </TabsContent>

                    <TabsContent value="training" className="mt-0 space-y-4">
                      <TrainingTab 
                        data={formData.training}
                        onChange={(data) => updateFormData('training', data)}
                      />
                    </TabsContent>

                    <TabsContent value="behavior" className="mt-0 space-y-4">
                      <BehaviorTab 
                        data={formData.behavior}
                        onChange={(data) => updateFormData('behavior', data)}
                      />
                    </TabsContent>

                    <TabsContent value="flow" className="mt-0 space-y-4">
                      <ConversationFlowTab 
                        data={formData.conversationFlow}
                        onChange={(data) => updateFormData('conversationFlow', data)}
                      />
                    </TabsContent>
                  </div>
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
