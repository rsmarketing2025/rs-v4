
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Link as LinkIcon, 
  Upload, 
  Save, 
  Trash2, 
  Plus, 
  HelpCircle,
  AlertCircle,
  Check 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AGENT_ID } from "./GeneralTab";

interface TrainingDataItem {
  id: string;
  user_id: string;
  tab_name: string;
  data_type: 'file' | 'link' | 'manual_prompt';
  file_name?: string;
  file_url?: string;
  file_type?: string;
  file_content?: string;
  link_title?: string;
  link_url?: string;
  link_description?: string;
  manual_prompt?: string;
  status: 'active' | 'deleted';
  created_at: string;
  updated_at: string;
}

export const ParadoxQuestionTab: React.FC = () => {
  const [trainingData, setTrainingData] = useState<TrainingDataItem[]>([]);
  const [manualPrompt, setManualPrompt] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const tabName = "paradox_question";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load all training data for this tab
      const { data, error } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', tabName)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database load error:', error);
        return;
      }

      // Type assertion for database results
      const typedData = data as TrainingDataItem[];
      setTrainingData(typedData);

      // Set manual prompt if exists
      const promptData = typedData.find(item => item.data_type === 'manual_prompt');
      if (promptData?.manual_prompt) {
        setManualPrompt(promptData.manual_prompt);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i + 1}/${files.length}:`, file.name);

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${tabName}/${fileName}`;

        console.log('Uploading to storage path:', filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('agent-training-files')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          toast({
            title: "Erro no upload",
            description: `Falha ao fazer upload do arquivo ${file.name}: ${uploadError.message}`,
            variant: "destructive",
          });
          continue;
        }

        console.log('File uploaded successfully:', uploadData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('agent-training-files')
          .getPublicUrl(filePath);

        console.log('Public URL generated:', publicUrl);

        // Prepare data for database insert
        const insertData = {
          user_id: user.id,
          tab_name: tabName,
          data_type: 'file' as const,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type || 'application/octet-stream',
          status: 'active' as const
        };

        console.log('Inserting file data to database:', insertData);

        // Store file metadata in database (each file gets its own record)
        const { data: dbData, error: dbError } = await supabase
          .from('agent_training_data')
          .insert(insertData)
          .select()
          .single();

        if (dbError) {
          console.error('Database insert error:', dbError);
          // Clean up uploaded file if database insert fails
          await supabase.storage
            .from('agent-training-files')
            .remove([filePath]);
          continue;
        }

        console.log('File data saved to database successfully:', dbData);
      }

      // Reload data to show uploaded files
      await loadData();

      toast({
        title: "Sucesso",
        description: `${files.length} arquivo(s) enviado(s) com sucesso!`,
      });

    } catch (error) {
      console.error('Error in file upload:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante o upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleDeleteFile = async (item: TrainingDataItem) => {
    try {
      console.log('Deleting file:', item);

      // Delete from database
      const { error: dbError } = await supabase
        .from('agent_training_data')
        .delete()
        .eq('id', item.id);

      if (dbError) {
        console.error('Database delete error:', dbError);
        toast({
          title: "Erro",
          description: "Erro ao deletar arquivo do banco de dados",
          variant: "destructive",
        });
        return;
      }

      // Delete from storage if file_url exists
      if (item.file_url) {
        try {
          // Extract file path from URL
          const urlParts = item.file_url.split('/');
          const bucketIndex = urlParts.indexOf('agent-training-files');
          if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
            const filePath = urlParts.slice(bucketIndex + 1).join('/');
            console.log('Deleting from storage path:', filePath);
            
            const { error: storageError } = await supabase.storage
              .from('agent-training-files')
              .remove([filePath]);

            if (storageError) {
              console.error('Storage delete error:', storageError);
            }
          }
        } catch (storageError) {
          console.error('Error deleting from storage:', storageError);
          // Continue even if storage deletion fails
        }
      }

      // Reload data
      await loadData();

      toast({
        title: "Sucesso",
        description: "Arquivo deletado com sucesso!",
      });

    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar arquivo",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLink = async (item: TrainingDataItem) => {
    try {
      const { error } = await supabase
        .from('agent_training_data')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      await loadData();
      toast({
        title: "Sucesso",
        description: "Link removido com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover link",
        variant: "destructive",
      });
    }
  };

  const collectAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Reload all data from database to ensure consistency
      const { data: allData, error } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', tabName)
        .eq('status', 'active');

      if (error) throw error;

      // Prepare data for webhook using reloaded data from database
      const files = allData?.filter(item => item.data_type === 'file') || [];
      const links = allData?.filter(item => item.data_type === 'link') || [];
      const promptData = allData?.find(item => item.data_type === 'manual_prompt');

      return {
        files: files.map(file => ({
          name: file.file_name,
          url: file.file_url,
          type: file.file_type
        })),
        links: links.map(link => ({
          title: link.link_title,
          url: link.link_url,
          description: link.link_description
        })),
        manual_text: promptData?.manual_prompt || ''
      };
    } catch (error) {
      console.error('Error collecting data:', error);
      throw error;
    }
  };

  const triggerWebhook = async (data: any) => {
    try {
      console.log('Triggering webhook with data:', data);
      
      const webhookUrl = `https://webhook-automatios-rsmtk.abbadigital.com.br/webhook/rag-rs-copy-${tabName}`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: AGENT_ID,
          tab_name: tabName,
          data: data,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Webhook response:', result);
      return result;
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  };

  const handleAddLink = async () => {
    if (!linkTitle || !linkUrl) {
      toast({
        title: "Erro",
        description: "Título e URL são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('agent_training_data')
        .insert({
          user_id: user.id,
          tab_name: tabName,
          data_type: 'link',
          link_title: linkTitle,
          link_url: linkUrl,
          link_description: linkDescription,
          status: 'active'
        });

      if (error) throw error;

      // Clear form
      setLinkTitle('');
      setLinkUrl('');
      setLinkDescription('');

      await loadData();
      toast({
        title: "Sucesso",
        description: "Link adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Error adding link:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar link",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save or update manual prompt
      if (manualPrompt.trim()) {
        const { error } = await supabase
          .from('agent_training_data')
          .upsert({
            user_id: user.id,
            tab_name: tabName,
            data_type: 'manual_prompt',
            manual_prompt: manualPrompt,
            status: 'active'
          }, {
            onConflict: 'user_id,tab_name,data_type'
          });

        if (error) throw error;
      }

      // Reload all data from database to ensure consistency
      const allData = await collectAllData();

      // Trigger webhook with database-consistent data
      await triggerWebhook(allData);

      toast({
        title: "Sucesso",
        description: "Dados salvos e enviados com sucesso!",
      });

      // Reload data to reflect any changes
      await loadData();

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

  const files = trainingData.filter(item => item.data_type === 'file');
  const links = trainingData.filter(item => item.data_type === 'link');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-orange-500" />
          <div>
            <h3 className="text-lg font-medium text-white">Pergunta Paradoxal</h3>
            <p className="text-sm text-neutral-400">
              Configure materiais e instruções para perguntas paradoxais
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-neutral-300 border-neutral-600">
          {AGENT_ID}
        </Badge>
      </div>

      {/* File Upload Section */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Arquivos de Treinamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`file-upload-${tabName}`} className="text-white">
              Adicionar Arquivos
            </Label>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="border-neutral-700 hover:bg-neutral-800"
                disabled={isUploading}
                onClick={() => document.getElementById(`file-upload-${tabName}`)?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Enviando...' : 'Selecionar Arquivos'}
              </Button>
              <input
                type="file"
                id={`file-upload-${tabName}`}
                multiple
                accept=".txt,.pdf,.doc,.docx,.json,.csv,.webp,.jpg,.jpeg,.png,.gif"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-neutral-500">
              Aceita: TXT, PDF, DOC, DOCX, JSON, CSV, WEBP, JPG, PNG, GIF (múltiplos arquivos)
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Arquivos Enviados:</h4>
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="text-sm text-white">{file.file_name}</p>
                      <p className="text-xs text-neutral-400">{file.file_type}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteFile(file)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Links Section */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Links de Referência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`link-title-${tabName}`} className="text-white">
                    Título do Link
                  </Label>
                  <Input
                    id={`link-title-${tabName}`}
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="Ex: Documentação oficial"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`link-url-${tabName}`} className="text-white">
                    URL
                  </Label>
                  <Input
                    id={`link-url-${tabName}`}
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://exemplo.com"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`link-desc-${tabName}`} className="text-white">
                  Descrição (opcional)
                </Label>
                <Textarea
                  id={`link-desc-${tabName}`}
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  placeholder="Breve descrição do conteúdo do link..."
                  className="bg-neutral-800 border-neutral-700 text-white resize-none"
                  rows={2}
                />
              </div>
              <Button 
                onClick={handleAddLink}
                variant="outline"
                className="border-neutral-700 hover:bg-neutral-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Link
              </Button>
            </div>
          </div>

          {/* Links List */}
          {links.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Links Adicionados:</h4>
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <LinkIcon className="w-4 h-4 text-neutral-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">{link.link_title}</p>
                      <p className="text-xs text-blue-400 truncate">{link.link_url}</p>
                      {link.link_description && (
                        <p className="text-xs text-neutral-400 mt-1">{link.link_description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteLink(link)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Prompt Section */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Conhecimento Manual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor={`manual-prompt-${tabName}`} className="text-white">
              Instruções e Conhecimento Específico
            </Label>
            <Textarea
              id={`manual-prompt-${tabName}`}
              value={manualPrompt}
              onChange={(e) => setManualPrompt(e.target.value)}
              placeholder="Adicione informações específicas sobre perguntas paradoxais, instruções especiais, ou conhecimento que o agente deve ter..."
              className="bg-neutral-800 border-neutral-700 text-white resize-none"
              rows={6}
            />
            <p className="text-xs text-neutral-500">
              Este texto será usado como conhecimento base para treinar o agente
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
          {isLoading ? 'Salvando e Enviando...' : 'Salvar e Enviar Dados'}
        </Button>
      </div>
    </div>
  );
};
