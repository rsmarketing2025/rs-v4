import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GitBranch, Plus, Trash2, X } from "lucide-react";

interface ConversationFlow {
  id: string;
  flow_name: string;
  flow_description?: string;
  flow_steps: string[];
  created_at: string;
}

interface FlowData {
  flows: ConversationFlow[];
}

export const ConversationFlows: React.FC = () => {
  const [flowData, setFlowData] = useState<FlowData>({ flows: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newFlow, setNewFlow] = useState({
    name: '',
    description: '',
    steps: [] as string[]
  });
  const [newStep, setNewStep] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', 'conversation_flows')
        .eq('data_type', 'manual_prompt')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.metadata) {
        const metadata = data.metadata as any;
        setFlowData({
          flows: Array.isArray(metadata.flows) ? metadata.flows : []
        });
      }
    } catch (error) {
      console.error('Error loading flows:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os fluxos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    const step = newStep.trim();
    if (step && !newFlow.steps.includes(step)) {
      setNewFlow(prev => ({
        ...prev,
        steps: [...prev.steps, step]
      }));
      setNewStep('');
    }
  };

  const removeStep = (stepToRemove: string) => {
    setNewFlow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step !== stepToRemove)
    }));
  };

  const addFlow = async () => {
    if (!newFlow.name.trim() || newFlow.steps.length === 0) {
      toast({
        title: "Erro",
        description: "Nome do fluxo e pelo menos uma etapa são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const newFlowObj: ConversationFlow = {
        id: Date.now().toString(),
        flow_name: newFlow.name.trim(),
        flow_description: newFlow.description.trim() || undefined,
        flow_steps: newFlow.steps,
        created_at: new Date().toISOString()
      };

      const updatedFlows = [...flowData.flows, newFlowObj];
      
      await saveFlows(updatedFlows);
      
      setFlowData({ flows: updatedFlows });
      setNewFlow({ name: '', description: '', steps: [] });
      
      toast({
        title: "Sucesso",
        description: "Fluxo adicionado com sucesso!"
      });
    } catch (error) {
      console.error('Error adding flow:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o fluxo.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteFlow = async (id: string) => {
    try {
      const updatedFlows = flowData.flows.filter(flow => flow.id !== id);
      await saveFlows(updatedFlows);
      
      setFlowData({ flows: updatedFlows });
      toast({
        title: "Sucesso",
        description: "Fluxo removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting flow:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o fluxo.",
        variant: "destructive"
      });
    }
  };

  const saveFlows = async (flows: ConversationFlow[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Convert flows to JSON-serializable format
    const serializedFlows = flows.map(flow => ({
      id: flow.id,
      flow_name: flow.flow_name,
      flow_description: flow.flow_description || null,
      flow_steps: flow.flow_steps,
      created_at: flow.created_at
    }));

    const metadata = { flows: serializedFlows };

    const { error } = await supabase
      .from('agent_training_data')
      .upsert({
        user_id: user.id,
        tab_name: 'conversation_flows',
        data_type: 'manual_prompt',
        title: 'Conversation Flows',
        metadata: metadata,
        status: 'active'
      }, {
        onConflict: 'user_id,tab_name,data_type'
      });
    
    if (error) throw error;
  };

  return (
    <Card className="bg-neutral-900 border-neutral-700 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Fluxos de Conversa
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] flex flex-col space-y-6">
        <Card className="bg-neutral-800 border-neutral-600">
          <CardHeader>
            <CardTitle className="text-white text-lg">Criar Novo Fluxo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flow-name" className="text-white">Nome do Fluxo</Label>
                <Input
                  id="flow-name"
                  value={newFlow.name}
                  onChange={(e) => setNewFlow(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Ex: Atendimento ao Cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flow-description" className="text-white">Descrição</Label>
                <Input
                  id="flow-description"
                  value={newFlow.description}
                  onChange={(e) => setNewFlow(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Descrição do fluxo..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Etapas do Fluxo</Label>
              <div className="flex gap-2">
                <Input
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStep())}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Adicionar etapa..."
                />
                <Button
                  onClick={addStep}
                  variant="outline"
                  size="sm"
                  className="border-neutral-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {newFlow.steps.length > 0 && (
                <ScrollArea className="h-32 mt-3">
                  <div className="space-y-2">
                    {newFlow.steps.map((step, index) => (
                      <div
                        key={index}
                        className="bg-neutral-700 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {index + 1}
                          </span>
                          <span className="text-white">{step}</span>
                        </div>
                        <Button
                          onClick={() => removeStep(step)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <Button
              onClick={addFlow}
              disabled={saving || !newFlow.name.trim() || newFlow.steps.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {saving ? 'Criando...' : 'Criar Fluxo'}
            </Button>
          </CardContent>
        </Card>

        <div className="flex-1 flex flex-col space-y-3">
          <h3 className="text-white font-medium">Fluxos Criados</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-neutral-800 rounded-lg p-4 h-32"></div>
              ))}
            </div>
          ) : flowData.flows.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">
              Nenhum fluxo criado ainda
            </p>
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {flowData.flows.map((flow) => (
                  <Card key={flow.id} className="bg-neutral-800 border-neutral-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-2">{flow.flow_name}</h4>
                          {flow.flow_description && (
                            <p className="text-neutral-400 text-sm mb-3">{flow.flow_description}</p>
                          )}
                          <div className="space-y-2">
                            <p className="text-sm text-neutral-300 font-medium">Etapas:</p>
                            <div className="space-y-1">
                              {flow.flow_steps.map((step: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[24px] text-center">
                                    {index + 1}
                                  </span>
                                  <span className="text-neutral-300">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-neutral-500 mt-3">
                            Criado em {new Date(flow.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFlow(flow.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
};