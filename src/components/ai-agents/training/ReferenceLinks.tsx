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
  created_at: string;
}

interface LinkData {
  links: ReferenceLink[];
}

export const ReferenceLinks: React.FC = () => {
  const [linkData, setLinkData] = useState<LinkData>({ links: [] });
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
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', 'training')
        .eq('data_type', 'link')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.length > 0) {
        const links = data.map(item => ({
          id: item.id,
          link_title: item.link_title || item.title || 'Sem título',
          link_url: item.link_url || '',
          link_description: item.link_description || item.description,
          created_at: item.created_at
        }));
        setLinkData({ links });
      }
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
        .from('agent_training_data')
        .insert({
          user_id: user.id,
          tab_name: 'training',
          data_type: 'link',
          title: newLink.title.trim(),
          link_title: newLink.title.trim(),
          link_url: newLink.url.trim(),
          link_description: newLink.description.trim() || null,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      const newLinkObj: ReferenceLink = {
        id: data.id,
        link_title: data.link_title,
        link_url: data.link_url,
        link_description: data.link_description,
        created_at: data.created_at
      };

      setLinkData(prev => ({ links: [newLinkObj, ...prev.links] }));
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
        .from('agent_training_data')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLinkData(prev => ({ 
        links: prev.links.filter(link => link.id !== id) 
      }));

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
    <Card className="bg-neutral-900 border-neutral-700 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Link className="w-5 h-5" />
          Links de Referência
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] flex flex-col space-y-6">
        <Card className="bg-neutral-800 border-neutral-600">
          <CardHeader>
            <CardTitle className="text-white text-lg">Adicionar Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="link-description" className="text-white">Descrição (opcional)</Label>
              <Textarea
                id="link-description"
                value={newLink.description}
                onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                className="bg-neutral-700 border-neutral-600 text-white resize-none"
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

        <div className="flex-1 flex flex-col space-y-3">
          <h3 className="text-white font-medium">Links Salvos</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-neutral-800 rounded-lg p-4 h-24"></div>
              ))}
            </div>
          ) : linkData.links.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">
              Nenhum link adicionado ainda
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3">
              {linkData.links.map((link) => (
                <Card key={link.id} className="bg-neutral-800 border-neutral-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{link.link_title}</h4>
                        <a
                          href={link.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                        >
                          {link.link_url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
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
                    
                    {link.link_description && (
                      <p className="text-neutral-300 text-sm mb-2">
                        {link.link_description}
                      </p>
                    )}
                    
                    <p className="text-xs text-neutral-500">
                      Adicionado em {new Date(link.created_at).toLocaleDateString('pt-BR')}
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