
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
    // Método 1: Scroll usando scrollIntoView
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
    
    // Método 2: Scroll direto no container como fallback
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, []);

  // Scroll automático quando mensagens ou loading mudam
  useEffect(() => {
    // Múltiplos timeouts para garantir que o scroll funcione
    const timers = [
      setTimeout(() => scrollToBottom(), 0),
      setTimeout(() => scrollToBottom(), 50),
      setTimeout(() => scrollToBottom(), 150),
      setTimeout(() => scrollToBottom(), 300),
    ];
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [messages, loading, scrollToBottom]);

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-neutral-400 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Inicie uma conversa com seu Copy Chief!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {loading && <TypingIndicator />}
        {/* Elemento invisível para marcar o final das mensagens */}
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </ScrollArea>
  );
};
