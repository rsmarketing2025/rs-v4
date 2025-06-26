
import React from 'react';
import { ChatHeader } from "./ChatHeader";
import { MessagesDisplay } from "./MessagesDisplay";
import { MessageInput } from "./MessageInput";
import { useConversationManagement } from "@/hooks/useConversationManagement";
import { useMessageHandling } from "@/hooks/useMessageHandling";

interface AgentChatProps {
  conversationId: string | null;
  onConversationChange: (id: string) => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  conversationId,
  onConversationChange
}) => {
  const {
    conversationTitle,
    isEditingTitle,
    setIsEditingTitle,
    updateConversationTitle,
    createNewConversation
  } = useConversationManagement(conversationId);

  const { messages, loading, sendMessage } = useMessageHandling(conversationId);

  const handleCreateNewConversation = async () => {
    const newConversationId = await createNewConversation();
    if (newConversationId) {
      onConversationChange(newConversationId);
    }
  };

  const handleSendMessage = (messageContent: string) => {
    sendMessage(messageContent, conversationId, onConversationChange);
  };

  return (
    <div className="flex flex-col h-full max-h-full bg-neutral-950">
      <ChatHeader
        conversationId={conversationId}
        conversationTitle={conversationTitle}
        isEditingTitle={isEditingTitle}
        onStartEditTitle={() => setIsEditingTitle(true)}
        onSaveTitle={updateConversationTitle}
        onCancelEdit={() => setIsEditingTitle(false)}
        onCreateNewConversation={handleCreateNewConversation}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden bg-neutral-950 min-h-0">
        <MessagesDisplay messages={messages} loading={loading} />
        <MessageInput onSendMessage={handleSendMessage} loading={loading} />
      </div>
    </div>
  );
};
