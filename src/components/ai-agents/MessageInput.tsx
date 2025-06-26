
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
    <div className="p-6 border-t border-neutral-800 flex-shrink-0 bg-neutral-950">
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          className="flex-1 min-h-[60px] max-h-[120px] bg-neutral-900 border-neutral-700 text-white placeholder-neutral-400 resize-none"
          disabled={loading}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="h-[60px] px-4 flex-shrink-0 bg-slate-50"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
