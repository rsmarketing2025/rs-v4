
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

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
  }, [messages, loading]);

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
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setConversationTitle(data.title);
      }
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

  const sendToWebhook = async (message: string, conversationId: string) => {
    console.log('Enviando mensagem para webhook:', message);
    
    try {
      const webhookUrl = 'https://webhook-automatios-rsmtk.abbadigital.com.br/webhook/agente-copy-rs';
      
      // Construir URL com parâmetros de query para GET
      const url = new URL(webhookUrl);
      url.searchParams.append('message', message);
      url.searchParams.append('timestamp', new Date().toISOString());
      url.searchParams.append('conversationId', conversationId);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Resposta do webhook - Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Tentar fazer parse JSON primeiro, se falhar, usar como texto
      let data;
      try {
        data = await response.json();
        console.log('Resposta do webhook - Data (JSON):', data);
      } catch (jsonError) {
        // Se não for JSON válido, usar como texto
        data = await response.text();
        console.log('Resposta do webhook - Data (Text):', data);
      }
      
      return data;
    } catch (error) {
      console.error('Error sending to webhook:', error);
      throw error;
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

      // Add user message to UI immediately
      const newUserMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageContent,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newUserMessage]);

      // Try to save user message to database (ignore RLS errors for now)
      try {
        await supabase
          .from('agent_messages')
          .insert({
            conversation_id: currentConversationId,
            role: 'user',
            content: messageContent
          });
      } catch (dbError) {
        console.warn('Could not save user message to database:', dbError);
      }

      // Send to webhook and get response
      try {
        const webhookResponse = await sendToWebhook(messageContent, currentConversationId);
        console.log('Resposta completa do webhook:', webhookResponse);
        
        // Extract AI response from webhook - melhorar a lógica de extração
        let aiResponseContent = 'Olá! Sou seu assistente Copy Chief. Como posso ajudá-lo hoje?';
        
        if (typeof webhookResponse === 'string') {
          // Se a resposta for uma string simples
          aiResponseContent = webhookResponse;
        } else if (webhookResponse && typeof webhookResponse === 'object') {
          // Se for um objeto, verificar diferentes campos possíveis
          if (webhookResponse.resposta) {
            aiResponseContent = webhookResponse.resposta;
          } else if (webhookResponse.response) {
            aiResponseContent = webhookResponse.response;
          } else if (webhookResponse.message) {
            aiResponseContent = webhookResponse.message;
          } else if (webhookResponse.answer) {
            aiResponseContent = webhookResponse.answer;
          } else {
            // Se não encontrar nenhum campo conhecido, usar a primeira propriedade string
            const firstStringValue = Object.values(webhookResponse).find(value => typeof value === 'string');
            if (firstStringValue) {
              aiResponseContent = firstStringValue as string;
            }
          }
        }

        console.log('Conteúdo extraído da resposta:', aiResponseContent);

        // Add AI response to UI
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponseContent,
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiResponse]);

        // Try to save AI response to database (ignore RLS errors for now)
        try {
          await supabase
            .from('agent_messages')
            .insert({
              conversation_id: currentConversationId,
              role: 'assistant',
              content: aiResponse.content
            });
        } catch (dbError) {
          console.warn('Could not save AI response to database:', dbError);
        }

      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        
        // Fallback response if webhook fails
        const fallbackResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Desculpe, houve um problema de conexão com o servidor. Tente novamente em alguns instantes.',
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, fallbackResponse]);

        // Try to save fallback response to database
        try {
          await supabase
            .from('agent_messages')
            .insert({
              conversation_id: currentConversationId,
              role: 'assistant',
              content: fallbackResponse.content
            });
        } catch (dbError) {
          console.warn('Could not save fallback response to database:', dbError);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    } finally {
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
    <div className="flex flex-col h-full">
      <Card className="flex-1 bg-slate-800/50 border-slate-700 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
          <CardTitle className="text-white">
            {conversationTitle || 'Chat com Copy Chief'}
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
        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Inicie uma conversa com seu Copy Chief!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                  />
                ))
              )}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-6 border-t border-slate-700 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 min-h-[60px] max-h-[120px] bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="h-[60px] px-4 bg-blue-600 hover:bg-blue-700 flex-shrink-0"
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
