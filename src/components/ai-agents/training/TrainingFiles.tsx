
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } = "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Trash2, Download } from "lucide-react";

interface TrainingFile {
  id: string;
  file_name: string;
  file_type: string;
  file_url?: string;
  file_content?: string;
  status: string;
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
        .from('agent_training_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
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

    // Verificar tipo de arquivo
    const allowedTypes = ['text/plain', 'application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Tipo de arquivo não suportado. Use TXT, PDF, CSV ou DOCX.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ler conteúdo do arquivo se for texto
      let fileContent = '';
      if (file.type === 'text/plain' || file.type === 'text/csv') {
        fileContent = await file.text();
      }

      const { data, error } = await supabase
        .from('agent_training_files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_content: fileContent,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setFiles(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso!"
      });

      // Limpar input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agent_training_files')
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

  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Arquivos de Treinamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center">
          <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-white cursor-pointer hover:text-blue-400">
              Clique para enviar arquivos ou arraste aqui
            </Label>
            <p className="text-sm text-neutral-400">
              Suporte para TXT, PDF, CSV, DOCX (máx. 10MB)
            </p>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".txt,.pdf,.csv,.docx"
            />
          </div>
        </div>

        {uploading && (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-neutral-400 mt-2">Enviando arquivo...</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-white font-medium">Arquivos Enviados</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-neutral-800 rounded-lg p-4 h-16"></div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">
              Nenhum arquivo enviado ainda
            </p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-neutral-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{file.file_name}</p>
                      <p className="text-sm text-neutral-400">
                        {new Date(file.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFile(file.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
