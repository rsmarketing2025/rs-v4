
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
    <ScrollArea ref={scrollAreaRef} className="flex-1">
      <div className="px-6 py-6">
        {/* Container principal com altura flexível */}
        <div className={`space-y-6 ${messages.length === 0 ? 'h-full flex flex-col' : ''}`}>
          {messages.length === 0 ? (
            /* Estado vazio - Centralização vertical e horizontal perfeita */
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="max-w-lg mx-auto space-y-8">
                {/* Ícone centralizado com design aprimorado */}
                <div className="flex justify-center">
                  <div className="p-8 bg-gradient-to-br from-neutral-900/60 to-neutral-800/40 rounded-2xl border border-neutral-700/50 shadow-xl">
                    <MessageSquare className="w-16 h-16 text-neutral-300" />
                  </div>
                </div>
                
                {/* Mensagem de boas-vindas centralizada */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-neutral-100">
                    Chat com Copy Chief
                  </h3>
                  <p className="text-neutral-400 text-lg leading-relaxed">
                    Inicie uma conversa com seu Copy Chief!<br />
                    Envie uma mensagem para começar.
                  </p>
                </div>
                
                {/* Sugestões visuais melhoradas */}
                <div className="grid grid-cols-1 gap-4 mt-10">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-900/20 to-blue-800/10 rounded-xl border border-blue-800/30 text-neutral-300 hover:bg-blue-900/30 transition-all duration-200 cursor-default">
                    <span className="text-blue-400 text-lg mr-3">💡</span>
                    Peça ajuda com copywriting
                  </div>
                  <div className="px-6 py-4 bg-gradient-to-r from-green-900/20 to-green-800/10 rounded-xl border border-green-800/30 text-neutral-300 hover:bg-green-900/30 transition-all duration-200 cursor-default">
                    <span className="text-green-400 text-lg mr-3">📝</span>
                    Solicite criação de conteúdo
                  </div>
                  <div className="px-6 py-4 bg-gradient-to-r from-purple-900/20 to-purple-800/10 rounded-xl border border-purple-800/30 text-neutral-300 hover:bg-purple-900/30 transition-all duration-200 cursor-default">
                    <span className="text-purple-400 text-lg mr-3">🎯</span>
                    Analise suas campanhas
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
      </div>
    </ScrollArea>
  );
};
