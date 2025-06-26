
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus, Trash2, Tag, X } from "lucide-react";

interface ManualContext {
  id: string;
  context_title: string;
  context_content: string;
  tags: string[];
  status: string;
  created_at: string;
}

export const ManualContexts: React.FC = () => {
  const [contexts, setContexts] = useState<ManualContext[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newContext, setNewContext] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
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
        .from('agent_manual_contexts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContexts(data || []);
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

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !newContext.tags.includes(tag)) {
      setNewContext(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewContext(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('agent_manual_contexts')
        .insert({
          user_id: user.id,
          context_title: newContext.title.trim(),
          context_content: newContext.content.trim(),
          tags: newContext.tags,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setContexts(prev => [data, ...prev]);
      setNewContext({ title: '', content: '', tags: [] });
      
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
      const { error } = await supabase
        .from('agent_manual_contexts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContexts(prev => prev.filter(context => context.id !== id));
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

  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Contextos Manuais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-neutral-800 border-neutral-600">
          <CardHeader>
            <CardTitle className="text-white text-lg">Adicionar Novo Contexto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="context-title" className="text-white">Título</Label>
              <Input
                id="context-title"
                value={newContext.title}
                onChange={(e) => setNewContext(prev => ({ ...prev, title: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="Ex: Política de Preços"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context-content" className="text-white">Conteúdo</Label>
              <Textarea
                id="context-content"
                value={newContext.content}
                onChange={(e) => setNewContext(prev => ({ ...prev, content: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white min-h-[120px]"
                placeholder="Descreva o contexto detalhadamente..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Adicionar tag..."
                />
                <Button
                  onClick={addTag}
                  variant="outline"
                  size="sm"
                  className="border-neutral-600"
                >
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              {newContext.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newContext.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-blue-600 text-white"
                    >
                      {tag}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
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

        <div className="space-y-3">
          <h3 className="text-white font-medium">Contextos Salvos</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-neutral-800 rounded-lg p-4 h-32"></div>
              ))}
            </div>
          ) : contexts.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">
              Nenhum contexto adicionado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {contexts.map((context) => (
                <Card key={context.id} className="bg-neutral-800 border-neutral-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-2">{context.context_title}</h4>
                        <p className="text-neutral-300 text-sm mb-3 line-clamp-3">
                          {context.context_content}
                        </p>
                        {context.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {context.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-neutral-600 text-neutral-200 text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-neutral-500">
                          Adicionado em {new Date(context.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContext(context.id)}
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
