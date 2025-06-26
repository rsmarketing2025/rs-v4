
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, Plus, Trash2, ExternalLink } from "lucide-react";

interface ReferenceLink {
  id: string;
  link_title: string;
  link_url: string;
  link_description?: string;
  status: string;
  created_at: string;
}

export const ReferenceLinks: React.FC = () => {
  const [links, setLinks] = useState<ReferenceLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('agent_reference_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error loading links:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os links.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addLink = async () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast({
        title: "Erro",
        description: "Título e URL são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('agent_reference_links')
        .insert({
          user_id: user.id,
          link_title: newLink.title.trim(),
          link_url: newLink.url.trim(),
          link_description: newLink.description.trim() || null,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setLinks(prev => [data, ...prev]);
      setNewLink({ title: '', url: '', description: '' });
      
      toast({
        title: "Sucesso",
        description: "Link adicionado com sucesso!"
      });
    } catch (error) {
      console.error('Error adding link:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o link.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agent_reference_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLinks(prev => prev.filter(link => link.id !== id));
      toast({
        title: "Sucesso",
        description: "Link removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o link.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Link className="w-5 h-5" />
          Links de Referência
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-neutral-800 border-neutral-600">
          <CardHeader>
            <CardTitle className="text-white text-lg">Adicionar Novo Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link-title" className="text-white">Título</Label>
                <Input
                  id="link-title"
                  value={newLink.title}
                  onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Ex: Documentação da API"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url" className="text-white">URL</Label>
                <Input
                  id="link-url"
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-description" className="text-white">Descrição (opcional)</Label>
              <Textarea
                id="link-description"
                value={newLink.description}
                onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white"
                placeholder="Descreva o conteúdo do link..."
                rows={3}
              />
            </div>
            <Button
              onClick={addLink}
              disabled={saving || !newLink.title.trim() || !newLink.url.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {saving ? 'Adicionando...' : 'Adicionar Link'}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="text-white font-medium">Links Salvos</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-neutral-800 rounded-lg p-4 h-20"></div>
              ))}
            </div>
          ) : links.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">
              Nenhum link adicionado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <Card key={link.id} className="bg-neutral-800 border-neutral-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-medium">{link.link_title}</h4>
                          <a
                            href={link.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-sm text-blue-400 mb-2">{link.link_url}</p>
                        {link.link_description && (
                          <p className="text-sm text-neutral-400">{link.link_description}</p>
                        )}
                        <p className="text-xs text-neutral-500 mt-2">
                          Adicionado em {new Date(link.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLink(link.id)}
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
