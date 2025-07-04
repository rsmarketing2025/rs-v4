
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, Link, FileText, Plus, X, File, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AGENT_ID } from "./GeneralTab";

interface FileItem {
  id: string;
  file_name: string;
  file_type: string;
  file_url?: string;
}

interface LinkItem {
  id: string;
  link_title: string;
  link_url: string;
  link_description?: string;
}

export const InvisibleStructureTab: React.FC = () => {
  const [manualPrompt, setManualPrompt] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const tabName = "invisible_structure";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load manual prompt
      const { data: promptData } = await supabase
        .from('agent_manual_contexts')
        .select('context_content')
        .eq('user_id', user.id)
        .eq('context_title', `${tabName}_manual_prompt`)
        .maybeSingle();

      if (promptData) {
        setManualPrompt(promptData.context_content || '');
      }

      // Load files
      const { data: filesData } = await supabase
        .from('agent_training_files')
        .select('id, file_name, file_type, file_url')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (filesData) {
        setFiles(filesData);
      }

      // Load links
      const { data: linksData } = await supabase
        .from('agent_reference_links')
        .select('id, link_title, link_url, link_description')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (linksData) {
        setLinks(linksData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Tipo de arquivo não permitido. Use PDF, Imagem, Doc ou CSV.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('agent_training_files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          status: 'active'
        })
        .select('id, file_name, file_type, file_url')
        .single();

      if (error) throw error;
      if (data) {
        setFiles(prev => [...prev, data]);
      }

      toast({
        title: "Sucesso",
        description: "Arquivo adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      toast({
        title: "Erro",
        description: "Título e URL são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('agent_reference_links')
        .insert({
          user_id: user.id,
          link_title: newLink.title,
          link_url: newLink.url,
          link_description: newLink.description,
          status: 'active'
        })
        .select('id, link_title, link_url, link_description')
        .single();

      if (error) throw error;
      if (data) {
        setLinks(prev => [...prev, data]);
      }
      setNewLink({ title: '', url: '', description: '' });

      toast({
        title: "Sucesso",
        description: "Link adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Error adding link:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar link.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('agent_training_files')
        .update({ status: 'deleted' })
        .eq('id', fileId);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));

      toast({
        title: "Sucesso",
        description: "Arquivo removido com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('agent_reference_links')
        .update({ status: 'deleted' })
        .eq('id', linkId);

      if (error) throw error;

      setLinks(prev => prev.filter(l => l.id !== linkId));

      toast({
        title: "Sucesso",
        description: "Link removido com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover link.",
        variant: "destructive",
      });
    }
  };

  const triggerWebhook = async (data: any) => {
    try {
      const webhookUrl = 'https://webhook-automatios-rsmtk.abbadigital.com.br/webhook/rag-rs-copy-estrutura-invisivel';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: AGENT_ID,
          tab_name: 'invisible_structure',
          data: data,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      console.log('Webhook triggered successfully');
    } catch (error) {
      console.error('Error triggering webhook:', error);
      // Don't throw error to avoid blocking the save operation
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save manual prompt
      const { error } = await supabase
        .from('agent_manual_contexts')
        .upsert({
          user_id: user.id,
          context_title: `${tabName}_manual_prompt`,
          context_content: manualPrompt,
          status: 'active'
        }, {
          onConflict: 'user_id,context_title'
        });

      if (error) throw error;

      // Prepare data for webhook
      const webhookData = {
        manual_prompt: manualPrompt,
        files: files,
        links: links,
        user_id: user.id
      };

      // Trigger webhook
      await triggerWebhook(webhookData);

      toast({
        title: "Sucesso",
        description: "Dados salvos com sucesso!",
      });

    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Estrutura Invisível
          </h3>
          <p className="text-sm text-neutral-400">
            Configure materiais e instruções para estrutura invisível de conteúdo
          </p>
        </div>
        <Badge variant="outline" className="text-neutral-300 border-neutral-600">
          {AGENT_ID}
        </Badge>
      </div>

      {/* Upload de Arquivos */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Arquivos de Treinamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor={`file-upload-${tabName}`} className="text-white">
                Anexar Arquivo (PDF, Imagem, Doc, CSV)
              </Label>
              <Input
                id={`file-upload-${tabName}`}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.csv"
                onChange={handleFileUpload}
                className="bg-neutral-800 border-neutral-700 text-white mt-2"
              />
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-neutral-400">Arquivos anexados:</p>
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-neutral-800 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white">{file.file_name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links de Referência */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Link className="w-4 h-4" />
            Links de Referência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor={`link-title-${tabName}`} className="text-white">
                  Título
                </Label>
                <Input
                  id={`link-title-${tabName}`}
                  value={newLink.title}
                  onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título do link"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor={`link-url-${tabName}`} className="text-white">
                  URL
                </Label>
                <Input
                  id={`link-url-${tabName}`}
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://exemplo.com"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor={`link-desc-${tabName}`} className="text-white">
                  Descrição
                </Label>
                <Input
                  id={`link-desc-${tabName}`}
                  value={newLink.description}
                  onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
            </div>
            
            <Button
              onClick={handleAddLink}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Link
            </Button>
            
            {links.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-neutral-400">Links adicionados:</p>
                {links.map((link) => (
                  <div key={link.id} className="flex items-center justify-between bg-neutral-800 p-3 rounded">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">{link.link_title}</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{link.link_url}</p>
                      {link.link_description && (
                        <p className="text-xs text-neutral-500 mt-1">{link.link_description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prompt Manual */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Prompt Manual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor={`manual-prompt-${tabName}`} className="text-white">
              Instruções Específicas
            </Label>
            <Textarea
              id={`manual-prompt-${tabName}`}
              value={manualPrompt}
              onChange={(e) => setManualPrompt(e.target.value)}
              placeholder="Digite instruções específicas para estrutura invisível..."
              className="bg-neutral-800 border-neutral-700 text-white resize-none"
              rows={6}
            />
            <p className="text-xs text-neutral-500">
              Este prompt será usado pelo agente para entender como trabalhar com estrutura invisível
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-neutral-800">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-slate-50 text-black hover:bg-slate-200"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};
