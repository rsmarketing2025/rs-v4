
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, AlertTriangle } from "lucide-react";

interface BehaviorTabProps {
  data: {
    forbiddenWords: string[];
    defaultResponses: Array<{ question: string; answer: string }>;
    fallbackMessage: string;
    goodResponseExamples: string[];
    responseLimit: number;
  };
  onChange: (data: any) => void;
}

export const BehaviorTab: React.FC<BehaviorTabProps> = ({ data, onChange }) => {
  const [newForbiddenWord, setNewForbiddenWord] = React.useState('');
  const [newQuestion, setNewQuestion] = React.useState('');
  const [newAnswer, setNewAnswer] = React.useState('');
  const [newExample, setNewExample] = React.useState('');

  const addForbiddenWord = () => {
    if (newForbiddenWord.trim()) {
      onChange({ 
        forbiddenWords: [...data.forbiddenWords, newForbiddenWord.trim()] 
      });
      setNewForbiddenWord('');
    }
  };

  const removeForbiddenWord = (index: number) => {
    const updated = data.forbiddenWords.filter((_, i) => i !== index);
    onChange({ forbiddenWords: updated });
  };

  const addDefaultResponse = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      onChange({ 
        defaultResponses: [...data.defaultResponses, { 
          question: newQuestion.trim(), 
          answer: newAnswer.trim() 
        }] 
      });
      setNewQuestion('');
      setNewAnswer('');
    }
  };

  const removeDefaultResponse = (index: number) => {
    const updated = data.defaultResponses.filter((_, i) => i !== index);
    onChange({ defaultResponses: updated });
  };

  const addGoodExample = () => {
    if (newExample.trim()) {
      onChange({ 
        goodResponseExamples: [...data.goodResponseExamples, newExample.trim()] 
      });
      setNewExample('');
    }
  };

  const removeGoodExample = (index: number) => {
    const updated = data.goodResponseExamples.filter((_, i) => i !== index);
    onChange({ goodResponseExamples: updated });
  };

  return (
    <div className="space-y-6">
      {/* Palavras Proibidas */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          Palavras Proibidas/Evitadas
        </Label>
        <div className="flex gap-2">
          <Input
            value={newForbiddenWord}
            onChange={(e) => setNewForbiddenWord(e.target.value)}
            placeholder="palavra ou expressão"
            className="bg-neutral-900 border-neutral-700 text-white"
            onKeyPress={(e) => e.key === 'Enter' && addForbiddenWord()}
          />
          <Button
            onClick={addForbiddenWord}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-neutral-400">
          Palavras que o agente deve evitar ou não usar nas respostas
        </p>
        
        {data.forbiddenWords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.forbiddenWords.map((word, index) => (
              <div key={index} className="flex items-center gap-1 bg-red-500/20 text-red-300 px-2 py-1 rounded text-sm">
                <span>{word}</span>
                <Button
                  onClick={() => removeForbiddenWord(index)}
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 text-red-400 hover:text-red-300"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Respostas Padrão */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium">
          Respostas Padrão para Perguntas Comuns
        </Label>
        <div className="space-y-2">
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Pergunta frequente..."
            className="bg-neutral-900 border-neutral-700 text-white"
          />
          <Textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Resposta padrão para esta pergunta..."
            className="bg-neutral-900 border-neutral-700 text-white"
          />
          <Button
            onClick={addDefaultResponse}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Resposta Padrão
          </Button>
        </div>
        
        {data.defaultResponses.length > 0 && (
          <div className="space-y-2">
            {data.defaultResponses.map((item, index) => (
              <div key={index} className="bg-neutral-900 rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-neutral-200">{item.question}</p>
                  <Button
                    onClick={() => removeDefaultResponse(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-neutral-400">{item.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mensagem de Fallback */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium">
          Mensagem de Fallback
        </Label>
        <Textarea
          value={data.fallbackMessage}
          onChange={(e) => onChange({ fallbackMessage: e.target.value })}
          placeholder="Desculpe, não consegui entender sua pergunta. Pode reformular ou tentar uma pergunta diferente?..."
          className="bg-neutral-900 border-neutral-700 text-white"
        />
        <p className="text-xs text-neutral-400">
          Mensagem exibida quando o agente não consegue responder
        </p>
      </div>

      {/* Exemplos de Boas Respostas */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium">
          Exemplos de Boas Respostas
        </Label>
        <div className="space-y-2">
          <Textarea
            value={newExample}
            onChange={(e) => setNewExample(e.target.value)}
            placeholder="Exemplo de uma resposta ideal do agente..."
            className="bg-neutral-900 border-neutral-700 text-white"
          />
          <Button
            onClick={addGoodExample}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Exemplo
          </Button>
        </div>
        
        {data.goodResponseExamples.length > 0 && (
          <div className="space-y-2">
            {data.goodResponseExamples.map((example, index) => (
              <div key={index} className="bg-neutral-900 rounded p-3 flex justify-between items-start">
                <p className="text-sm text-neutral-300 flex-1">{example}</p>
                <Button
                  onClick={() => removeGoodExample(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Limites de Resposta */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium">
          Limite de Caracteres por Resposta
        </Label>
        <Input
          type="number"
          value={data.responseLimit}
          onChange={(e) => onChange({ responseLimit: parseInt(e.target.value) || 500 })}
          className="bg-neutral-900 border-neutral-700 text-white w-32"
          min="100"
          max="2000"
        />
        <p className="text-xs text-neutral-400">
          Número máximo de caracteres por resposta (100-2000)
        </p>
      </div>

      {/* Exemplo */}
      <div className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
        <h4 className="text-sm font-medium text-neutral-200 mb-2">Exemplo de Configuração</h4>
        <div className="text-xs text-neutral-400 space-y-1">
          <p>• Evitar: "não sei", "talvez", palavrões</p>
          <p>• Fallback: "Posso ajudar de outra forma?"</p>
          <p>• Limite: 500 caracteres por resposta</p>
        </div>
      </div>
    </div>
  );
};
