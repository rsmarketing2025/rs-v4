import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, MessageSquare, Pen, Check, X } from "lucide-react";
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Função de scroll suave e confiável
  const scrollToBottom = useCallback(() => {
    // Usar requestAnimationFrame para garantir que o DOM foi atualizado
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "end" 
        });
      }
    });
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      loadConversationTitle();
    } else {
      setMessages([]);
      setConversationTitle('');
    }
  }, [conversationId]);

  // Scroll automático sempre que mensagens ou loading mudam
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Scroll adicional após um pequeno delay para garantir renderização completa
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  const loadMessages = async () => {
    if (!conversationId) return;

    try {
      console.log('Carregando mensagens para conversa:', conversationId);
      
      const { data, error } = await supabase
        .from('agent_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        throw error;
      }
      
      console.log('Mensagens carregadas:', data);
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

  const handleEditTitle = () => {
    setEditTitleValue(conversationTitle);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!conversationId || !editTitleValue.trim()) return;

    try {
      const { error } = await supabase
        .from('agent_conversations')
        .update({ title: editTitleValue.trim() })
        .eq('id', conversationId);

      if (error) throw error;

      setConversationTitle(editTitleValue.trim());
      setIsEditingTitle(false);
      
      toast({
        title: "Sucesso",
        description: "Título da conversa atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o título da conversa.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditTitleValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const createNewConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Criando nova conversa para usuário:', user.id);

      const { data, error } = await supabase
        .from('agent_conversations')
        .insert({
          user_id: user.id,
          title: 'Nova Conversa'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar conversa:', error);
        throw error;
      }
      
      console.log('Nova conversa criada:', data);
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

        console.log('Criando nova conversa automaticamente...');

        const { data, error } = await supabase
          .from('agent_conversations')
          .insert({
            user_id: user.id,
            title: messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : '')
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar conversa:', error);
          throw error;
        }
        
        console.log('Conversa criada automaticamente:', data);
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

      // Save user message to database
      try {
        console.log('Salvando mensagem do usuário...');
        const { error: userMsgError } = await supabase
          .from('agent_messages')
          .insert({
            conversation_id: currentConversationId,
            role: 'user',
            content: messageContent
          });

        if (userMsgError) {
          console.error('Erro ao salvar mensagem do usuário:', userMsgError);
        } else {
          console.log('Mensagem do usuário salva com sucesso');
        }
      } catch (dbError) {
        console.warn('Could not save user message to database:', dbError);
      }

      // Send to webhook and get response
      try {
        const webhookResponse = await sendToWebhook(messageContent, currentConversationId);
        console.log('Resposta completa do webhook:', webhookResponse);
        
        // Extract AI response from webhook
        let aiResponseContent = 'Olá! Sou seu assistente Copy Chief. Como posso ajudá-lo hoje?';
        
        if (typeof webhookResponse === 'string') {
          aiResponseContent = webhookResponse;
        } else if (webhookResponse && typeof webhookResponse === 'object') {
          if (webhookResponse.resposta) {
            aiResponseContent = webhookResponse.resposta;
          } else if (webhookResponse.response) {
            aiResponseContent = webhookResponse.response;
          } else if (webhookResponse.message) {
            aiResponseContent = webhookResponse.message;
          } else if (webhookResponse.answer) {
            aiResponseContent = webhookResponse.answer;
          } else {
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

        // Save AI response to database
        try {
          console.log('Salvando resposta da IA...');
          const { error: aiMsgError } = await supabase
            .from('agent_messages')
            .insert({
              conversation_id: currentConversationId,
              role: 'assistant',
              content: aiResponse.content
            });

          if (aiMsgError) {
            console.error('Erro ao salvar resposta da IA:', aiMsgError);
          } else {
            console.log('Resposta da IA salva com sucesso');
          }
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

        // Save fallback response to database
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

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 bg-neutral-950 border-neutral-800 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0 bg-neutral-950">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="bg-neutral-900 border-neutral-700 text-white flex-1"
                  autoFocus
                />
                <Button
                  onClick={handleSaveTitle}
                  size="sm"
                  variant="ghost"
                  className="text-green-400 hover:text-green-300 h-8 w-8 p-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <CardTitle className="text-white truncate">
                  {conversationTitle || 'Chat com Copy Chief'}
                </CardTitle>
                {conversationId && (
                  <Button
                    onClick={handleEditTitle}
                    size="sm"
                    variant="ghost"
                    className="text-neutral-400 hover:text-white h-8 w-8 p-0"
                    title="Editar título"
                  >
                    <Pen className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
          <Button
            onClick={createNewConversation}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 flex-shrink-0 ml-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden bg-neutral-950">
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-4 py-4 min-h-full">
              {messages.length === 0 ? (
                <div className="text-center text-neutral-400 py-8">
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
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </ScrollArea>
          
          <div className="p-6 border-t border-neutral-800 flex-shrink-0 bg-neutral-950">
            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleInputKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 min-h-[60px] max-h-[120px] bg-neutral-900 border-neutral-700 text-white placeholder-neutral-400 resize-none"
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="h-[60px] px-4 bg-neutral-800 hover:bg-neutral-700 flex-shrink-0"
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
