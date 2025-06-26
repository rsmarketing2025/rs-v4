
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
      <div className="space-y-4 min-h-full">
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
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </ScrollArea>
  );
};
