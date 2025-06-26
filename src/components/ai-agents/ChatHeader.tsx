
import React, { useState } from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pen, Check, X } from "lucide-react";

interface ChatHeaderProps {
  conversationId: string | null;
  conversationTitle: string;
  isEditingTitle: boolean;
  onStartEditTitle: () => void;
  onSaveTitle: (title: string) => Promise<boolean>;
  onCancelEdit: () => void;
  onCreateNewConversation: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversationId,
  conversationTitle,
  isEditingTitle,
  onStartEditTitle,
  onSaveTitle,
  onCancelEdit,
  onCreateNewConversation
}) => {
  const [editTitleValue, setEditTitleValue] = useState('');

  const handleStartEdit = () => {
    setEditTitleValue(conversationTitle);
    onStartEditTitle();
  };

  const handleSaveTitle = async () => {
    const success = await onSaveTitle(editTitleValue);
    if (success) {
      onCancelEdit();
      setEditTitleValue('');
    }
  };

  const handleCancelEdit = () => {
    onCancelEdit();
    setEditTitleValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-neutral-950 border-b border-neutral-800">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="bg-neutral-900 border-neutral-700 text-white flex-1 h-9"
              autoFocus
            />
            <Button
              onClick={handleSaveTitle}
              size="sm"
              variant="ghost"
              className="text-green-400 hover:text-green-300 hover:bg-green-400/10 h-9 w-9 p-0"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleCancelEdit}
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-9 w-9 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h2 className="text-white truncate text-lg font-semibold">
              {conversationTitle || 'Chat com Copy Chief'}
            </h2>
            {conversationId && (
              <Button
                onClick={handleStartEdit}
                size="sm"
                variant="ghost"
                className="text-neutral-400 hover:text-white hover:bg-neutral-800 h-9 w-9 p-0 flex-shrink-0"
                title="Editar título"
              >
                <Pen className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-shrink-0 ml-4">
        <Button
          onClick={onCreateNewConversation}
          variant="outline"
          size="sm"
          className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white px-4 py-2 h-9 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>
      </div>
    </div>
  );
};
