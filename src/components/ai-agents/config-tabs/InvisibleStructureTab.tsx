
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, Link, FileText, Plus, X, File, Eye, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AGENT_ID } from "./GeneralTab";

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
  const { toast } = useToast();

  const tabName = "invisible_structure";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Loading data for user:', user.id);

      // Load all training data for this tab
      const { data: trainingData, error } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', tabName)
        .eq('status', 'active');

      if (error) {
        console.error('Database load error:', error);
        throw error;
      }

      console.log('Loaded training data:', trainingData);

      if (trainingData) {
        // Type assertion for database results
        const typedData = trainingData as TrainingDataItem[];
        
        // Separate data by type
        const promptData = typedData.find(item => item.data_type === 'manual_prompt');
        const filesData = typedData.filter(item => item.data_type === 'file'); 
        const linksData = typedData.filter(item => item.data_type === 'link');

        console.log('Parsed data:', { promptData, filesData, linksData });

        setManualPrompt(promptData?.manual_prompt || '');
        setFiles(filesData);
        setLinks(linksData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do servidor.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    console.log('Starting file upload:', { 
      fileCount: selectedFiles.length, 
      files: Array.from(selectedFiles).map(f => ({ name: f.name, size: f.size, type: f.type }))
    });

    // Validate file types with more comprehensive list
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/gif',
      'image/webp',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/csv',
      'text/plain',
      'application/json'
    ];
    
    // Check if all files are valid
    const invalidFiles = Array.from(selectedFiles).filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        title: "Erro",
        description: `Tipos de arquivo não permitidos: ${invalidFiles.map(f => f.name).join(', ')}. Use PDF, Imagem, Doc, CSV, TXT ou JSON.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('User authenticated:', user.id);

      const uploadedFiles: TrainingDataItem[] = [];
      const totalFiles = selectedFiles.length;

      // Process files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Create unique file path with user ID and timestamp
        const fileExt = file.name.split('.').pop();
        const fileName = `invisible_structure/${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        console.log(`Uploading file ${i + 1}/${totalFiles} to storage path:`, fileName);

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

        // Read file content for text-based files
        let fileContent = '';
        if (file.type === 'text/plain' || file.type === 'text/csv' || file.type === 'application/json') {
          try {
            fileContent = await file.text();
            console.log('File content read successfully, length:', fileContent.length);
          } catch (contentError) {
            console.warn('Could not read file content:', contentError);
          }
        }

        // Prepare data for database insert
        const insertData = {
          user_id: user.id,
          tab_name: tabName,
          data_type: 'file' as const,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          file_content: fileContent || null,
          status: 'active'
        };

        console.log('Inserting file data to database:', insertData);

        // Store file metadata in database (each file gets its own record)
        const { data, error } = await supabase
          .from('agent_training_data')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('Database insert error:', error);
          // Clean up uploaded file if database insert fails
          await supabase.storage.from('agent-training-files').remove([fileName]);
          throw new Error(`Erro ao salvar dados do arquivo ${file.name}: ${error.message}`);
        }

        if (data) {
          console.log('File data saved to database successfully:', data);
          uploadedFiles.push(data as TrainingDataItem);
        }
      }

      // Update state with all uploaded files
      setFiles(prev => [...prev, ...uploadedFiles]);

      toast({
        title: "Sucesso",
        description: `${totalFiles} arquivo(s) enviado(s) e adicionado(s) com sucesso!`,
      });

      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar arquivo(s).",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find the file to get its URL for storage deletion
      const fileToDelete = files.find(f => f.id === fileId);
      
      // Delete from database
      const { error } = await supabase
        .from('agent_training_data')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      // If file has a URL, extract the path and delete from storage
      if (fileToDelete?.file_url) {
        const url = new URL(fileToDelete.file_url);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const filePath = `${user.id}/${fileName}`;
        
        // Delete from storage (don't throw error if file doesn't exist)
        await supabase.storage
          .from('agent-training-files')
          .remove([filePath]);
      }

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
        .delete()
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
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save or update manual prompt
      // First, try to find existing manual_prompt entry
      const { data: existingPrompt } = await supabase
        .from('agent_training_data')
        .select('id')
        .eq('user_id', user.id)
        .eq('tab_name', tabName)
        .eq('data_type', 'manual_prompt')
        .maybeSingle();

      let error;
      if (existingPrompt) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('agent_training_data')
          .update({
            manual_prompt: manualPrompt,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPrompt.id);
        error = updateError;
      } else {
        // Insert new entry
        const { error: insertError } = await supabase
          .from('agent_training_data')
          .insert({
            user_id: user.id,
            tab_name: tabName,
            data_type: 'manual_prompt',
            manual_prompt: manualPrompt,
            status: 'active'
          });
        error = insertError;
      }

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
                Anexar Arquivo(s) (PDF, Imagem, Doc, CSV, TXT, JSON)
              </Label>
              <p className="text-xs text-neutral-400 mt-1">
                Você pode selecionar múltiplos arquivos segurando Ctrl (ou Cmd no Mac). Tipos suportados: PDF, JPG, PNG, GIF, WEBP, DOC, DOCX, CSV, TXT, JSON
              </p>
              <Input
                id={`file-upload-${tabName}`}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.csv,.txt,.json"
                onChange={handleFileUpload}
                className="bg-neutral-800 border-neutral-700 text-white mt-2"
                multiple
                disabled={isLoading}
              />
              {isLoading && (
                <p className="text-xs text-blue-400 mt-2">⏳ Fazendo upload dos arquivos...</p>
              )}
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-neutral-400">Arquivos anexados:</p>
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-neutral-800 p-3 rounded border border-neutral-700">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <File className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">{file.file_name}</span>
                        {file.file_size && (
                          <span className="text-xs text-neutral-500">
                            ({(file.file_size / 1024).toFixed(1)} KB)
                          </span>
                        )}
                      </div>
                      {file.file_url ? (
                        <div className="flex items-center gap-2">
                          <a 
                            href={file.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/30 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Visualizar arquivo
                          </a>
                          <span className="text-xs text-neutral-500">
                            Clique para abrir em nova aba
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
                          ⚠️ URL do arquivo não disponível
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 ml-2"
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
