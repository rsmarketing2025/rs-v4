import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Trash2, Download } from "lucide-react";

interface TrainingFile {
  id: string;
  file_name: string;
  file_type: string;
  file_url?: string;
  file_content?: string;
  file_size?: number;
  created_at: string;
}

export const TrainingFiles: React.FC = () => {
  const [files, setFiles] = useState<TrainingFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', 'training')
        .eq('data_type', 'file')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const trainingFiles = (data || []).map(item => ({
        id: item.id,
        file_name: item.file_name || 'Arquivo sem nome',
        file_type: item.file_type || 'unknown',
        file_url: item.file_url,
        file_content: item.file_content,
        file_size: item.file_size,
        created_at: item.created_at
      }));
      
      setFiles(trainingFiles);
    } catch (error) {
      console.error('Error loading files:', error);
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

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. Tamanho máximo: 10MB.",
        variant: "destructive"
      });
      return;
    }

    // Validate file type - support more file types including images
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
      toast({
        title: "Erro",
        description: "Tipo de arquivo não suportado. Use: TXT, PDF, DOC, DOCX, CSV, JSON, PNG, JPG, JPEG, GIF, WEBP, XLS, XLSX.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let fileContent = null;
      let fileUrl = null;

      // Handle file storage based on type and size
      if (file.type === 'text/plain' || file.type === 'application/json' || file.type === 'text/csv') {
        // For text files under 1MB, store content directly
        if (file.size < 1024 * 1024) {
          fileContent = await file.text();
        } else {
          // For larger text files, upload to storage
          const fileName = `${user.id}/${Date.now()}_${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('agent-training-files')
            .upload(fileName, file);
          
          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('agent-training-files')
            .getPublicUrl(fileName);
          
          fileUrl = publicUrl;
          console.log('Generated file URL for large text file:', fileUrl);
        }
      } else {
        // For binary files (PDF, DOC, images, etc.), always upload to storage
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        console.log('Uploading file to storage:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('agent-training-files')
          .upload(fileName, file);
        
        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        
        console.log('Upload successful, getting public URL...');
        const { data: { publicUrl } } = supabase.storage
          .from('agent-training-files')
          .getPublicUrl(fileName);
        
        fileUrl = publicUrl;
        console.log('Generated file URL:', fileUrl);
      }

      const { data, error } = await supabase
        .from('agent_training_data')
        .insert({
          user_id: user.id,
          tab_name: 'training',
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

      if (error) throw error;

      const newFile: TrainingFile = {
        id: data.id,
        file_name: data.file_name,
        file_type: data.file_type,
        file_size: data.file_size,
        file_content: data.file_content,
        file_url: data.file_url,
        created_at: data.created_at
      };

      setFiles(prev => [newFile, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Arquivo carregado com sucesso!"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
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
      const { error } = await supabase
        .from('agent_training_data')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFiles(prev => prev.filter(file => file.id !== id));
      toast({
        title: "Sucesso",
        description: "Arquivo removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting file:', error);
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