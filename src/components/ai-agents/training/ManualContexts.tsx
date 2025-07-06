import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus, Trash2, Edit2 } from "lucide-react";

interface ManualContext {
  id: string;
  context_title: string;
  context_content: string;
  tags?: string[];
  created_at: string;
}

interface ContextData {
  contexts: ManualContext[];
}

export const ManualContexts: React.FC = () => {
  const [contextData, setContextData] = useState<ContextData>({ contexts: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newContext, setNewContext] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', 'manual_contexts')
        .eq('data_type', 'manual_prompt')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.metadata) {
        const metadata = data.metadata as any;
        setContextData({
          contexts: Array.isArray(metadata.contexts) ? metadata.contexts : []
        });
      }
    } catch (error) {
      console.error('Error loading contexts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contextos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContexts = async (contexts: ManualContext[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const serializedContexts = contexts.map(context => ({
      id: context.id,
      context_title: context.context_title,
      context_content: context.context_content,
      tags: context.tags || [],
      created_at: context.created_at
    }));

    const metadata = { contexts: serializedContexts };

    const { error } = await supabase
      .from('agent_training_data')
      .upsert({
        user_id: user.id,
        tab_name: 'manual_contexts',
        data_type: 'manual_prompt',
        title: 'Manual Contexts',
        metadata: metadata,
        status: 'active'
      }, {
        onConflict: 'user_id,tab_name,data_type'
      });
    
    if (error) throw error;
  };

  const addContext = async () => {
    if (!newContext.title.trim() || !newContext.content.trim()) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const newContextObj: ManualContext = {
        id: Date.now().toString(),
        context_title: newContext.title.trim(),
        context_content: newContext.content.trim(),
        tags: newContext.tags ? newContext.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        created_at: new Date().toISOString()
      };

      const updatedContexts = [...contextData.contexts, newContextObj];
      
      await saveContexts(updatedContexts);
      
      setContextData({ contexts: updatedContexts });
      setNewContext({ title: '', content: '', tags: '' });
      
      toast({
        title: "Sucesso",
        description: "Contexto adicionado com sucesso!"
      });
    } catch (error) {
      console.error('Error adding context:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o contexto.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteContext = async (id: string) => {
    try {
      const updatedContexts = contextData.contexts.filter(context => context.id !== id);
      await saveContexts(updatedContexts);
      
      setContextData({ contexts: updatedContexts });
      toast({
        title: "Sucesso",
        description: "Contexto removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting context:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o contexto.",
        variant: "destructive"
      });
    }
  };

  const updateContext = async (id: string, updatedFields: Partial<ManualContext>) => {
    try {
      const updatedContexts = contextData.contexts.map(context =>
        context.id === id ? { ...context, ...updatedFields } : context
      );
      
      await saveContexts(updatedContexts);
      
      setContextData({ contexts: updatedContexts });
      setEditingId(null);
      
      toast({
        title: "Sucesso",
        description: "Contexto atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Error updating context:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o contexto.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-700 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Contextos Manuais
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] flex flex-col space-y-6">
        <Card className="bg-neutral-800 border-neutral-600">
          <CardHeader>
            <CardTitle className="text-white text-lg">Adicionar Contexto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="context-title" className="text-white">Título</Label>
              <Input
                id="context-title"
                value={newContext.title}
                onChange={(e) => setNewContext(prev => ({ ...prev, title: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="Ex: Informações sobre produtos"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="context-content" className="text-white">Conteúdo</Label>
              <Textarea
                id="context-content"
                value={newContext.content}
                onChange={(e) => setNewContext(prev => ({ ...prev, content: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white resize-none"
                placeholder="Descreva o contexto ou informação que o agente deve conhecer..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="context-tags" className="text-white">Tags (separadas por vírgula)</Label>
              <Input
                id="context-tags"
                value={newContext.tags}
                onChange={(e) => setNewContext(prev => ({ ...prev, tags: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="produto, vendas, suporte"
              />
            </div>
            
            <Button
              onClick={addContext}
              disabled={saving || !newContext.title.trim() || !newContext.content.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {saving ? 'Adicionando...' : 'Adicionar Contexto'}
            </Button>
          </CardContent>
        </Card>

        <div className="flex-1 flex flex-col space-y-3">
          <h3 className="text-white font-medium">Contextos Salvos</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-neutral-800 rounded-lg p-4 h-32"></div>
              ))}
            </div>
          ) : contextData.contexts.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">
              Nenhum contexto adicionado ainda
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3">
              {contextData.contexts.map((context) => (
                <Card key={context.id} className="bg-neutral-800 border-neutral-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-white font-medium">{context.context_title}</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(editingId === context.id ? null : context.id)}
                          className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteContext(context.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-neutral-300 text-sm mb-3 whitespace-pre-wrap">
                      {context.context_content}
                    </p>
                    
                    {context.tags && context.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {context.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-neutral-500">
                      Criado em {new Date(context.created_at).toLocaleDateString('pt-BR')}
                    </p>
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