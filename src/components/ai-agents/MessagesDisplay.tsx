
import React, { useRef, useEffect, useCallback } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface MessagesDisplayProps {
  messages: Message[];
  loading: boolean;
}

export const MessagesDisplay: React.FC<MessagesDisplayProps> = ({
  messages,
  loading
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    // Primary method: Target the ScrollArea's viewport directly
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
        return;
      }
    }
    
    // Fallback: Use scrollIntoView on the marker element
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, []);

  // Effect for new messages
  useEffect(() => {
    if (messages.length > 0) {
      // Immediate scroll attempt
      scrollToBottom();
      
      // Fallback with delay for DOM updates
      const timeoutId = setTimeout(scrollToBottom, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, scrollToBottom]);

  // Effect for typing indicator
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [loading, scrollToBottom]);

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
      {/* Container principal - Centralização aprimorada */}
      <div className={`space-y-6 ${messages.length === 0 ? 'min-h-full flex flex-col' : 'min-h-full'}`}>
        {messages.length === 0 ? (
          /* Estado vazio - Centralização vertical e horizontal */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              {/* Ícone centralizado com animação sutil */}
              <div className="flex justify-center">
                <div className="p-6 bg-neutral-900/50 rounded-full border border-neutral-800">
                  <MessageSquare className="w-12 h-12 text-neutral-400" />
                </div>
              </div>
              
              {/* Mensagem de boas-vindas centralizada */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-neutral-200">
                  Chat com Copy Chief
                </h3>
                <p className="text-neutral-400 text-base leading-relaxed">
                  Inicie uma conversa com seu Copy Chief!<br />
                  Envie uma mensagem para começar.
                </p>
              </div>
              
              {/* Sugestões visuais */}
              <div className="grid grid-cols-1 gap-3 mt-8">
                <div className="px-4 py-3 bg-neutral-900/30 rounded-lg border border-neutral-800/50 text-sm text-neutral-300">
                  💡 Peça ajuda com copywriting
                </div>
                <div className="px-4 py-3 bg-neutral-900/30 rounded-lg border border-neutral-800/50 text-sm text-neutral-300">
                  📝 Solicite criação de conteúdo
                </div>
                <div className="px-4 py-3 bg-neutral-900/30 rounded-lg border border-neutral-800/50 text-sm text-neutral-300">
                  🎯 Analise suas campanhas
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Lista de mensagens - Espaçamento otimizado */
          <div className="space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {loading && (
              <div className="py-2">
                <TypingIndicator />
              </div>
            )}
          </div>
        )}
        
        {/* Marcador para scroll automático */}
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </ScrollArea>
  );
};
