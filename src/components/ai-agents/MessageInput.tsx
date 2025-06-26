
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  loading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  loading
}) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    /* Container principal - Padding otimizado e bordas refinadas */
    <div className="px-6 py-5 bg-neutral-950 border-t border-neutral-800">
      {/* Layout do input - Alinhamento aprimorado */}
      <div className="flex gap-4 items-end max-w-full">
        {/* Textarea - Design aprimorado */}
        <div className="flex-1 min-w-0">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="w-full min-h-[56px] max-h-[120px] px-4 py-3 bg-neutral-900 border-neutral-700 text-white placeholder-neutral-400 resize-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-neutral-600"
            disabled={loading}
            rows={2}
          />
        </div>
        
        {/* Botão de envio - Design aprimorado */}
        <div className="flex-shrink-0">
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="h-[56px] w-[56px] p-0 flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:text-neutral-500 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            size="sm"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Hint text - Espaçamento refinado */}
      <p className="text-xs text-neutral-500 mt-3 px-1 opacity-75">
        Pressione Enter para enviar, Shift+Enter para nova linha
      </p>
    </div>
  );
};
