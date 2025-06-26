
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Plus, Link, X, FileText } from "lucide-react";

interface TrainingTabProps {
  data: {
    uploadedFiles: any[];
    referenceLinks: string[];
    manualContext: string;
    knowledgeBase: any;
  };
  onChange: (data: any) => void;
}

export const TrainingTab: React.FC<TrainingTabProps> = ({ data, onChange }) => {
  const [newLink, setNewLink] = React.useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }));
    
    onChange({ 
      uploadedFiles: [...data.uploadedFiles, ...fileData] 
    });
    console.log('Arquivos adicionados (preparado para upload):', fileData);
  };

  const removeFile = (index: number) => {
    const updatedFiles = data.uploadedFiles.filter((_, i) => i !== index);
    onChange({ uploadedFiles: updatedFiles });
  };

  const addReferenceLink = () => {
    if (newLink.trim()) {
      onChange({ 
        referenceLinks: [...data.referenceLinks, newLink.trim()] 
      });
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    const updatedLinks = data.referenceLinks.filter((_, i) => i !== index);
    onChange({ referenceLinks: updatedLinks });
  };

  const handleContextChange = (value: string) => {
    onChange({ manualContext: value });
  };

  return (
    <div className="space-y-6">
      {/* Upload de Arquivos */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium">
          Upload de Arquivos de Treinamento
        </Label>
        <div className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center hover:border-neutral-600 transition-colors">
          <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-400 mb-3">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-xs text-neutral-500 mb-3">
            Suporta: PDF, TXT, CSV, DOCX (máx. 10MB cada)
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.csv,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <Upload className="w-4 h-4 mr-2" />
            Selecionar Arquivos
          </Button>
        </div>
        
        {data.uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-neutral-400">Arquivos adicionados:</p>
            {data.uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-neutral-900 rounded p-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-200">{file.name}</span>
                  <span className="text-xs text-neutral-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  onClick={() => removeFile(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Links de Referência */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium">
          Links de Referência
        </Label>
        <div className="flex gap-2">
          <Input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://exemplo.com/documento-referencia"
            className="bg-neutral-900 border-neutral-700 text-white"
            onKeyPress={(e) => e.key === 'Enter' && addReferenceLink()}
          />
          <Button
            onClick={addReferenceLink}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-neutral-400">
          Adicione URLs de documentos, artigos ou páginas para treinar o agente
        </p>
        
        {data.referenceLinks.length > 0 && (
          <div className="space-y-2">
            {data.referenceLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between bg-neutral-900 rounded p-2">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-neutral-400" />
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 truncate max-w-xs"
                  >
                    {link}
                  </a>
                </div>
                <Button
                  onClick={() => removeLink(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contexto Manual */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium">
          Contexto Manual
        </Label>
        <Textarea
          value={data.manualContext}
          onChange={(e) => handleContextChange(e.target.value)}
          placeholder="Insira informações importantes, políticas da empresa, processos específicos, ou qualquer contexto que o agente deve conhecer..."
          className="bg-neutral-900 border-neutral-700 text-white min-h-[120px]"
        />
        <p className="text-xs text-neutral-400">
          Texto livre com informações específicas para o treinamento do agente
        </p>
      </div>

      {/* Base de Conhecimento Externa */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium">
          Base de Conhecimento Externa
        </Label>
        <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
          <p className="text-sm text-neutral-300 mb-3">
            Conecte APIs externas ou bancos de dados (funcionalidade futura)
          </p>
          <Button
            variant="outline"
            disabled
            className="border-neutral-700 text-neutral-500"
          >
            Configurar Integração
          </Button>
          <p className="text-xs text-neutral-500 mt-2">
            Em desenvolvimento - permitirá conectar CRM, bases de dados, APIs, etc.
          </p>
        </div>
      </div>

      {/* Exemplo */}
      <div className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
        <h4 className="text-sm font-medium text-neutral-200 mb-2">Exemplo de Treinamento</h4>
        <div className="text-xs text-neutral-400 space-y-1">
          <p>• Faça upload de PDFs com políticas da empresa</p>
          <p>• Adicione links para documentação técnica</p>
          <p>• Insira contexto sobre produtos/serviços no campo manual</p>
        </div>
      </div>
    </div>
  );
};
