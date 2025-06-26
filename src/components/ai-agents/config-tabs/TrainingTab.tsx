
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Link, FileText, Trash2, Plus } from "lucide-react";

export const TrainingTab: React.FC = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>(['']);
  const [manualText, setManualText] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implementar upload de arquivos
    console.log('Upload de arquivos:', event.target.files);
  };

  const addLink = () => {
    setLinks([...links, '']);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // TODO: Implementar integração com backend
    console.log('Salvando dados de treinamento:', { files, links, manualText });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white">Dados de Treinamento</h3>
        <p className="text-sm text-neutral-400">
          Adicione materiais para treinar e personalizar seu agente
        </p>
      </div>

      {/* Upload de Arquivos */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload de Arquivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center hover:border-neutral-600 transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
              <p className="text-sm text-neutral-400 mb-2">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.txt,.doc,.docx"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  Selecionar Arquivos
                </Button>
              </label>
            </div>
            <p className="text-xs text-neutral-500">
              Formatos suportados: PDF, TXT, DOC, DOCX (máx. 10MB cada)
            </p>
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
          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                  placeholder="https://exemplo.com"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
                <Button
                  onClick={() => removeLink(index)}
                  variant="outline"
                  size="sm"
                  className="px-3"
                  disabled={links.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button onClick={addLink} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Texto Manual */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Conhecimento Manual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Adicione informações específicas, instruções especiais, ou conhecimento que o agente deve ter..."
            className="bg-neutral-800 border-neutral-700 text-white resize-none"
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end pt-4 border-t border-neutral-800">
        <Button onClick={handleSave} className="bg-slate-50 text-black hover:bg-slate-200">
          Salvar Treinamento
        </Button>
      </div>
    </div>
  );
};
