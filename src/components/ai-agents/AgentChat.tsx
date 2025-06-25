
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageBubble } from "./MessageBubble";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface AgentChatProps {
  conversationId: string | null;
  onConversationChange: (id: string) => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({ 
  conversationId, 
  onConversationChange 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      loadConversationTitle();
    } else {
      setMessages([]);
      setConversationTitle('');
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('agent_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive",
      });
    }
  };

  const loadConversationTitle = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('agent_conversations')
        .select('title')
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      setConversationTitle(data.title);
    } catch (error) {
      console.error('Error loading conversation title:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('agent_conversations')
        .insert({
          user_id: user.id,
          title: 'Nova Conversa'
        })
        .select()
        .single();

      if (error) throw error;
      onConversationChange(data.id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar uma nova conversa.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageContent = input.trim();
    setInput('');
    setLoading(true);

    try {
      // Create conversation if it doesn't exist
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('agent_conversations')
          .insert({
            user_id: user.id,
            title: messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : '')
          })
          .select()
          .single();

        if (error) throw error;
        currentConversationId = data.id;
        onConversationChange(currentConversationId);
      }

      // Add user message
      const { error: userMessageError } = await supabase
        .from('agent_messages')
        .insert({
          conversation_id: currentConversationId,
          role: 'user',
          content: messageContent
        });

      if (userMessageError) throw userMessageError;

      // Update messages immediately
      const newUserMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: messageContent,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newUserMessage]);

      // TODO: Call webhook to get AI response
      // For now, we'll add a placeholder response
      setTimeout(async () => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: 'Olá! Sou seu assistente de IA para otimização de campanhas. Como posso ajudá-lo hoje?',
          created_at: new Date().toISOString()
        };

        // Save AI response to database
        await supabase
          .from('agent_messages')
          .insert({
            conversation_id: currentConversationId,
            role: 'assistant',
            content: aiResponse.content
          });

        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <Card className="flex-1 bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-white">
            {conversationTitle || 'Chat com IA'}
          </CardTitle>
          <Button
            onClick={createNewConversation}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col h-full p-0">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Inicie uma conversa com seu assistente de IA!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                  />
                ))
              )}
              {loading && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Assistente está pensando...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-6 border-t border-slate-700">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 min-h-[60px] bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="px-4 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
