
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Link, Plus, X, Eye, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AGENT_ID } from "./GeneralTab";
import { FixedTrainingFiles } from "../training/FixedTrainingFiles";

interface TrainingDataItem {
  id: string;
  user_id: string;
  tab_name: string;
  data_type: 'file' | 'link' | 'manual_prompt';
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  file_url?: string | null;
  file_content?: string | null;
  link_title?: string | null;
  link_url?: string | null;
  link_description?: string | null;
  manual_prompt?: string | null;
  title?: string | null;
  description?: string | null;
  metadata?: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export const InvisibleStructureTab: React.FC = () => {
  const [manualPrompt, setManualPrompt] = useState('');
  const [files, setFiles] = useState<TrainingDataItem[]>([]);
  const [links, setLinks] = useState<TrainingDataItem[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const tabName = "invisible_structure";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Loading invisible structure data...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ User not authenticated');
        return;
      }

      console.log(`👤 Loading data for user: ${user.id}, tab: ${tabName}`);

      // Load all training data for this tab
      const { data: trainingData, error } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', tabName)
        .eq('status', 'active');

      if (error) {
        console.error('❌ Database error loading data:', error);
        throw error;
      }

      console.log(`✅ Loaded ${trainingData?.length || 0} training data items`);

      if (trainingData) {
        // Type assertion for database results
        const typedData = trainingData as TrainingDataItem[];
        
        // Separate data by type
        const promptData = typedData.find(item => item.data_type === 'manual_prompt');
        const filesData = typedData.filter(item => item.data_type === 'file'); 
        const linksData = typedData.filter(item => item.data_type === 'link');

        console.log(`📝 Manual prompt: ${promptData ? 'Found' : 'Not found'}`);
        console.log(`📁 Files: ${filesData.length}`);
        console.log(`🔗 Links: ${linksData.length}`);

        setManualPrompt(promptData?.manual_prompt || '');
        setFiles(filesData);
        setLinks(linksData);
      }
    } catch (error) {
      console.error('❌ Error loading invisible structure data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive"
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
        .from('agent_training_data')
        .insert({
          user_id: user.id,
          tab_name: tabName,
          data_type: 'link',
          link_title: newLink.title,
          link_url: newLink.url,
          link_description: newLink.description,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setLinks(prev => [...prev, data as TrainingDataItem]);
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


  const handleDeleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('agent_training_data')
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


  const handleSave = async () => {
    if (isSaving) return; // Prevent double saves
    
    setIsSaving(true);
    
    try {
      console.log('💾 Starting save operation...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ User not authenticated');
        return;
      }

      console.log(`👤 Saving for user: ${user.id}, tab: ${tabName}`);

      // Save or update manual prompt if not empty
      if (manualPrompt.trim()) {
        console.log('📝 Saving manual prompt...');
        
        // First check if a manual prompt already exists
        const { data: existingPrompt } = await supabase
          .from('agent_training_data')
          .select('id')
          .eq('user_id', user.id)
          .eq('tab_name', tabName)
          .eq('data_type', 'manual_prompt')
          .eq('status', 'active')
          .single();

        if (existingPrompt) {
          // Update existing
          const { error: updateError } = await supabase
            .from('agent_training_data')
            .update({
              manual_prompt: manualPrompt,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPrompt.id);

          if (updateError) throw updateError;
          console.log('✅ Manual prompt updated');
        } else {
          // Create new
          const { error: insertError } = await supabase
            .from('agent_training_data')
            .insert({
              user_id: user.id,
              tab_name: tabName,
              data_type: 'manual_prompt',
              manual_prompt: manualPrompt,
              status: 'active'
            });

          if (insertError) throw insertError;
          console.log('✅ Manual prompt created');
        }

        // ALSO SAVE TO ESTRUTURA_INVISIVEL TABLE
        console.log('📝 Also saving to estrutura_invisivel table...');
        const { error: estruturaError } = await supabase
          .from('estrutura_invisivel')
          .insert({
            titulo: 'Prompt Manual - Estrutura Invisível',
            conteudo: manualPrompt,
            categoria: 'prompt_manual',
            tipo_estrutura: 'instrucoes',
            nicho: 'geral',
            tom: 'formal',
            publico_alvo: 'geral',
            tags: ['prompt_manual', 'estrutura_invisivel'],
            fonte: 'configuracao_usuario',
            ativo: true
          });

        if (estruturaError) {
          console.error('❌ Error saving to estrutura_invisivel:', estruturaError);
        } else {
          console.log('✅ Manual prompt also saved to estrutura_invisivel');
        }
      }

      // Save files to estrutura_invisivel as well
      if (files.length > 0) {
        console.log('📁 Saving files to estrutura_invisivel...');
        for (const file of files) {
          if (file.file_content) {
            const { error: fileError } = await supabase
              .from('estrutura_invisivel')
              .insert({
                titulo: file.file_name || 'Arquivo sem nome',
                conteudo: file.file_content,
                categoria: 'arquivo',
                tipo_estrutura: 'documento',
                nicho: 'geral',
                tom: 'neutro',
                publico_alvo: 'geral',
                tags: ['arquivo', file.file_type || 'documento'],
                fonte: 'upload_usuario',
                ativo: true
              });

            if (fileError) {
              console.error('❌ Error saving file to estrutura_invisivel:', fileError);
            } else {
              console.log(`✅ File ${file.file_name} saved to estrutura_invisivel`);
            }
          }
        }
      }

      // Save links content to estrutura_invisivel as well
      if (links.length > 0) {
        console.log('🔗 Saving links to estrutura_invisivel...');
        for (const link of links) {
          const { error: linkError } = await supabase
            .from('estrutura_invisivel')
            .insert({
              titulo: link.link_title || 'Link sem título',
              conteudo: `${link.link_description || 'Sem descrição'}\n\nURL: ${link.link_url}`,
              categoria: 'link_referencia',
              tipo_estrutura: 'referencia',
              nicho: 'geral',
              tom: 'informativo',
              publico_alvo: 'geral',
              tags: ['link', 'referencia'],
              fonte: link.link_url,
              ativo: true
            });

          if (linkError) {
            console.error('❌ Error saving link to estrutura_invisivel:', linkError);
          } else {
            console.log(`✅ Link ${link.link_title} saved to estrutura_invisivel`);
          }
        }
      }

      // Reload data to ensure consistency
      await loadData();

      toast({
        title: "Sucesso",
        description: "Dados salvos em ambas as tabelas com sucesso!",
      });

    } catch (error) {
      console.error('❌ Error saving data:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FixedTrainingFiles 
          tabName={tabName} 
          onFilesChange={(newFiles) => {
            console.log(`📁 Files updated: ${newFiles.length} files`);
            setFiles(newFiles.map(f => ({
              ...f,
              data_type: 'file' as const,
              user_id: '', // Will be set by the component
              tab_name: tabName,
              title: f.file_name,
              link_title: null,
              link_url: null,
              link_description: null,
              manual_prompt: null,
              description: null,
              metadata: null,
              updated_at: f.created_at
            })));
          }} 
        />

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
      </div>

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
          disabled={isSaving}
          className="bg-slate-50 text-black hover:bg-slate-200"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};
