import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, Link, FileText, Plus, X, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AGENT_ID } from "./GeneralTab";

interface ConfigTabBaseProps {
  tabName: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

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

export const ConfigTabBase: React.FC<ConfigTabBaseProps> = ({
  tabName,
  title,
  description,
  icon: Icon
}) => {
  const [manualPrompt, setManualPrompt] = useState('');
  const [files, setFiles] = useState<TrainingDataItem[]>([]);
  const [links, setLinks] = useState<TrainingDataItem[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [tabName]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load all training data for this tab
      const { data: trainingData } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', tabName)
        .eq('status', 'active');

      if (trainingData) {
        // Type assertion for database results
        const typedData = trainingData as TrainingDataItem[];
        
        // Separate data by type
        const promptData = typedData.find(item => item.data_type === 'manual_prompt');
        const filesData = typedData.filter(item => item.data_type === 'file'); 
        const linksData = typedData.filter(item => item.data_type === 'link');

        setManualPrompt(promptData?.manual_prompt || '');
        setFiles(filesData);
        setLinks(linksData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Validate file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv'];
    
    // Check if all files are valid
    const invalidFiles = Array.from(selectedFiles).filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        title: "Erro",
        description: `Tipos de arquivo não permitidos: ${invalidFiles.map(f => f.name).join(', ')}. Use PDF, Imagem, Doc ou CSV.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const uploadedFiles: TrainingDataItem[] = [];
      const totalFiles = selectedFiles.length;

      // Process files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Create unique file path with user ID and timestamp
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        console.log(`Uploading file ${i + 1}/${totalFiles} to storage:`, fileName);

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('agent-training-files')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error(`Erro no upload do arquivo ${file.name}: ${uploadError.message}`);
        }

        console.log('File uploaded successfully:', uploadData);

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('agent-training-files')
          .getPublicUrl(fileName);

        console.log('Generated public URL:', publicUrl);

        // Save file metadata to database with URL (remove unique constraint conflict)
        const { data, error } = await supabase
          .from('agent_training_data')
          .insert({
            user_id: user.id,
            tab_name: tabName,
            data_type: 'file',
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: publicUrl,
            status: 'active'
          })
          .select()
          .single();

        if (error) {
          console.error('Database insert error:', error);
          // Clean up uploaded file if database insert fails
          await supabase.storage.from('agent-training-files').remove([fileName]);
          throw new Error(`Erro ao salvar dados do arquivo ${file.name}: ${error.message}`);
        }

        if (data) {
          console.log('File data saved to database:', data);
          uploadedFiles.push(data as TrainingDataItem);
        }
      }

      // Update state with all uploaded files
      setFiles(prev => [...prev, ...uploadedFiles]);

      toast({
        title: "Sucesso",
        description: `${totalFiles} arquivo(s) adicionado(s) com sucesso!`,
      });

      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao adicionar arquivo(s).",
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

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('agent_training_data')
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

  const triggerWebhook = async (data: any) => {
    try {
      const webhookUrl = `https://webhook-automatios-rsmtk.abbadigital.com.br/webhook/rag-rs-copy-${tabName}`;
      
      console.log(`Sending data to webhook: ${webhookUrl}`, data);
      
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
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      console.log('Webhook triggered successfully');
    } catch (error) {
      console.error('Error triggering webhook:', error);
      // Don't throw here - webhook failure shouldn't block the save operation
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save or update manual prompt
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

      // Reload all data from database to ensure consistency
      const { data: trainingData } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', tabName)
        .eq('status', 'active');

      // Prepare data for webhook using reloaded data from database
      const webhookData = {
        manual_prompt: trainingData?.find(item => item.data_type === 'manual_prompt')?.manual_prompt || '',
        files: trainingData?.filter(item => item.data_type === 'file') || [],
        links: trainingData?.filter(item => item.data_type === 'link') || [],
        user_id: user.id
      };

      console.log('Webhook data prepared:', webhookData);

      // Trigger webhook with database-consistent data
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
            <Icon className="w-5 h-5" />
            {title}
          </h3>
          <p className="text-sm text-neutral-400">
            {description}
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
                Anexar Arquivo(s) (PDF, Imagem, Doc, CSV)
              </Label>
              <p className="text-xs text-neutral-400 mt-1">
                Você pode selecionar múltiplos arquivos segurando Ctrl (ou Cmd no Mac)
              </p>
              <Input
                id={`file-upload-${tabName}`}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.csv"
                onChange={handleFileUpload}
                className="bg-neutral-800 border-neutral-700 text-white mt-2"
                multiple
              />
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-neutral-400">Arquivos anexados:</p>
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-neutral-800 p-3 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white">{file.file_name}</span>
                      </div>
                      {file.file_url && (
                        <div className="mt-2">
                          <p className="text-xs text-neutral-400">Link do arquivo:</p>
                          <a 
                            href={file.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 break-all"
                          >
                            {file.file_url}
                          </a>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
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
              placeholder={`Digite instruções específicas para ${title.toLowerCase()}...`}
              className="bg-neutral-800 border-neutral-700 text-white resize-none"
              rows={6}
            />
            <p className="text-xs text-neutral-500">
              Este prompt será usado pelo agente para entender como trabalhar com {title.toLowerCase()}
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
