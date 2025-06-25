
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
  };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`p-3 rounded-lg ${
            isUser
              ? 'bg-neutral-800 text-white ml-auto'
              : 'bg-neutral-700 text-neutral-100'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p className={`text-xs text-neutral-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
        </p>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center order-2">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};
