import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Trash2, RefreshCw } from "lucide-react";

interface TrainingFile {
  id: string;
  file_name: string;
  file_type: string;
  file_url?: string;
  file_content?: string;
  file_size?: number;
  created_at: string;
  status: string;
}

interface FixedTrainingFilesProps {
  tabName?: string;
  onFilesChange?: (files: TrainingFile[]) => void;
}

export const FixedTrainingFiles: React.FC<FixedTrainingFilesProps> = ({ 
  tabName = 'invisible_structure',
  onFilesChange 
}) => {
  const [files, setFiles] = useState<TrainingFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, [tabName]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ User not authenticated');
        return;
      }

      console.log(`🔍 Loading files for tab: ${tabName}, user: ${user.id}`);

      const { data, error } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', tabName)
        .eq('data_type', 'file')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      console.log(`✅ Loaded ${data?.length || 0} files from database`);
      
      const trainingFiles = (data || []).map(item => ({
        id: item.id,
        file_name: item.file_name || 'Arquivo sem nome',
        file_type: item.file_type || 'unknown',
        file_url: item.file_url,
        file_content: item.file_content,
        file_size: item.file_size,
        created_at: item.created_at,
        status: item.status
      }));
      
      setFiles(trainingFiles);
      onFilesChange?.(trainingFiles);
    } catch (error) {
      console.error('❌ Error loading files:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os arquivos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(`📤 Starting upload for file: ${file.name}, size: ${file.size} bytes`);

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. Tamanho máximo: 10MB.",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      console.error('❌ File type not allowed:', file.type);
      toast({
        title: "Erro",
        description: "Tipo de arquivo não suportado. Use: TXT, PDF, DOC, DOCX, CSV, JSON, PNG, JPG, JPEG, GIF, WEBP, XLS, XLSX.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    let fileUrl: string | null = null; // Declare in outer scope for cleanup

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log(`👤 User authenticated: ${user.id}`);

      let fileContent = null;

      // Always upload to storage for consistency
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      console.log(`☁️ Uploading to storage: ${fileName}`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('agent-training-files')
        .upload(fileName, file);
      
      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log('✅ File uploaded to storage successfully');
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('agent-training-files')
        .getPublicUrl(fileName);
      
      fileUrl = publicUrl;
      console.log(`🔗 Generated public URL: ${fileUrl}`);

      // For small text files, also store content
      if ((file.type === 'text/plain' || file.type === 'application/json' || file.type === 'text/csv') && file.size < 1024 * 1024) {
        fileContent = await file.text();
        console.log(`📝 File content stored (${fileContent.length} chars)`);
      }

      // Save metadata to database
      console.log('💾 Saving metadata to database...');
      const { data, error } = await supabase
        .from('agent_training_data')
        .insert({
          user_id: user.id,
          tab_name: tabName,
          data_type: 'file',
          title: file.name,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_content: fileContent,
          file_url: fileUrl,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Metadata saved to database');

      const newFile: TrainingFile = {
        id: data.id,
        file_name: data.file_name,
        file_type: data.file_type,
        file_size: data.file_size,
        file_content: data.file_content,
        file_url: data.file_url,
        created_at: data.created_at,
        status: data.status
      };

      setFiles(prev => {
        const updated = [newFile, ...prev];
        onFilesChange?.(updated);
        return updated;
      });
      
      toast({
        title: "Sucesso",
        description: "Arquivo carregado com sucesso!"
      });
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      
      // Try to clean up storage if database save failed
      // This is best effort cleanup
      if (fileUrl) {
        try {
          const url = new URL(fileUrl);
          const pathParts = url.pathname.split('/');
          const storageFileName = pathParts.slice(-2).join('/'); // user_id/filename
          await supabase.storage
            .from('agent-training-files')
            .remove([storageFileName]);
          console.log('🧹 Cleaned up storage file after error');
        } catch (cleanupError) {
          console.warn('⚠️ Could not clean up storage file:', cleanupError);
        }
      }
      
      toast({
        title: "Erro",
        description: "Não foi possível carregar o arquivo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const deleteFile = async (id: string) => {
    try {
      console.log(`🗑️ Deleting file: ${id}`);
      
      const fileToDelete = files.find(f => f.id === id);
      
      // Update database record to mark as deleted
      const { error } = await supabase
        .from('agent_training_data')
        .update({ status: 'deleted' })
        .eq('id', id);

      if (error) throw error;

      // Try to delete from storage if file_url exists
      if (fileToDelete?.file_url) {
        try {
          const url = new URL(fileToDelete.file_url);
          const pathParts = url.pathname.split('/');
          const storageFileName = pathParts.slice(-2).join('/'); // user_id/filename
          
          console.log(`🗑️ Removing from storage: ${storageFileName}`);
          
          const { error: storageError } = await supabase.storage
            .from('agent-training-files')
            .remove([storageFileName]);
          
          if (storageError) {
            console.warn('⚠️ Could not remove from storage:', storageError);
          } else {
            console.log('✅ File removed from storage');
          }
        } catch (urlError) {
          console.warn('⚠️ Could not parse file URL for storage deletion:', urlError);
        }
      }

      const updatedFiles = files.filter(file => file.id !== id);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
      
      toast({
        title: "Sucesso",
        description: "Arquivo removido com sucesso!"
      });
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o arquivo.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Tamanho desconhecido';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('text')) return '📃';
    if (fileType.includes('json')) return '🔧';
    if (fileType.includes('csv') || fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📁';
  };

  return (
    <Card className="bg-neutral-900 border-neutral-700 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Arquivos de Treinamento
          <Button
            variant="ghost"
            size="sm"
            onClick={loadFiles}
            disabled={loading}
            className="ml-auto text-neutral-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] flex flex-col space-y-6">
        <Card className="bg-neutral-800 border-neutral-600">
          <CardHeader>
            <CardTitle className="text-white text-lg">Carregar Arquivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-white">
                Selecionar Arquivo
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="bg-neutral-700 border-neutral-600 text-white file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white"
                  accept=".txt,.pdf,.doc,.docx,.csv,.json,.png,.jpg,.jpeg,.gif,.webp,.xls,.xlsx"
                />
                {uploading && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <Upload className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                Formatos suportados: TXT, PDF, DOC, DOCX, CSV, JSON, PNG, JPG, JPEG, GIF, WEBP, XLS, XLSX (máx. 10MB)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 flex flex-col space-y-3">
          <h3 className="text-white font-medium">Arquivos Carregados</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-neutral-800 rounded-lg p-4 h-20"></div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">
              Nenhum arquivo carregado ainda
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3">
              {files.map((file) => (
                <Card key={file.id} className="bg-neutral-800 border-neutral-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{getFileIcon(file.file_type)}</span>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{file.file_name}</h4>
                          <div className="space-y-1">
                            <p className="text-xs text-neutral-400">
                              Tipo: {file.file_type}
                            </p>
                            <p className="text-xs text-neutral-400">
                              Tamanho: {formatFileSize(file.file_size)}
                            </p>
                            <p className="text-xs text-neutral-500">
                              Carregado em {new Date(file.created_at).toLocaleDateString('pt-BR')}
                            </p>
                            {file.file_url && (
                              <div className="mt-2">
                                <p className="text-xs text-neutral-400">URL:</p>
                                <a 
                                  href={file.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 break-all"
                                >
                                  {file.file_url.length > 60 ? 
                                    file.file_url.substring(0, 60) + '...' : 
                                    file.file_url
                                  }
                                </a>
                              </div>
                            )}
                            {!file.file_url && (
                              <p className="text-xs text-red-400">❌ URL não disponível</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteFile(file.id)}
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