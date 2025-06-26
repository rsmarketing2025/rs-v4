
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GitBranch, Plus, Trash2, Edit, Save, X } from "lucide-react";

interface ConversationFlow {
  id: string;
  flow_name: string;
  flow_description?: string;
  flow_steps: string[];
  conditions: Record<string, any>;
  escalation_rules: Record<string, any>;
  status: string;
  created_at: string;
}

export const ConversationFlows: React.FC = () => {
  const [flows, setFlows] = useState<ConversationFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingFlow, setEditingFlow] = useState<string | null>(null);
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
        .from('agent_conversation_flows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedFlows = (data || []).map(flow => ({
        id: flow.id,
        flow_name: flow.flow_name,
        flow_description: flow.flow_description,
        flow_steps: Array.isArray(flow.flow_steps) ? flow.flow_steps : [],
        conditions: flow.conditions && typeof flow.conditions === 'object' && !Array.isArray(flow.conditions) 
          ? flow.conditions as Record<string, any> 
          : {},
        escalation_rules: flow.escalation_rules && typeof flow.escalation_rules === 'object' && !Array.isArray(flow.escalation_rules) 
          ? flow.escalation_rules as Record<string, any> 
          : {},
        status: flow.status,
        created_at: flow.created_at
      }));
      
      setFlows(transformedFlows);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('agent_conversation_flows')
        .insert({
          user_id: user.id,
          flow_name: newFlow.name.trim(),
          flow_description: newFlow.description.trim() || null,
          flow_steps: newFlow.steps,
          conditions: {},
          escalation_rules: {},
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the new flow to match our interface
      const transformedFlow: ConversationFlow = {
        id: data.id,
        flow_name: data.flow_name,
        flow_description: data.flow_description,
        flow_steps: Array.isArray(data.flow_steps) ? data.flow_steps : [],
        conditions: data.conditions && typeof data.conditions === 'object' && !Array.isArray(data.conditions) 
          ? data.conditions as Record<string, any> 
          : {},
        escalation_rules: data.escalation_rules && typeof data.escalation_rules === 'object' && !Array.isArray(data.escalation_rules) 
          ? data.escalation_rules as Record<string, any> 
          : {},
        status: data.status,
        created_at: data.created_at
      };

      setFlows(prev => [transformedFlow, ...prev]);
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
      const { error } = await supabase
        .from('agent_conversation_flows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFlows(prev => prev.filter(flow => flow.id !== id));
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

  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Fluxos de Conversa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
                <div className="space-y-2 mt-3">
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

        <div className="space-y-3">
          <h3 className="text-white font-medium">Fluxos Criados</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-neutral-800 rounded-lg p-4 h-32"></div>
              ))}
            </div>
          ) : flows.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">
              Nenhum fluxo criado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {flows.map((flow) => (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};
