import { Loader2, MessageCircle, X } from 'lucide-react';
import { ChatInput } from './components/chatbots/chat-input';
import { ChatMessages } from './components/chatbots/chat-messages';
import { useEffect, useState } from 'react';
import { Message } from './lib/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  BASE_URL,
  createMessage,
  getChatId,
  getChatMessages,
  lastActivity,
} from './services/client-assistant-services';

function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      messageid: `temp-${Date.now()}`,
      created_at: new Date(),
      role: 'agent',
      content:
        "Bienvenue 👋 ! Je suis l'assistant virtuel de la Chambre de Commerce et d'Industrie Franco-mexicaine. Comment puis-je vous aider? \n ¡Bienvenido 👋! Soy el asistente virtual de la Cámara de Comercio e Industria Franco-Mexicana. ¿En qué puedo ayudarle?",
    },
  ]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: chatIdData } = useQuery({
    queryKey: ['chatId'],
    queryFn: () => getChatId(),
    refetchOnMount: true,
    staleTime: 0,
  });
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', chatIdData],
    queryFn: () => {
      if (!chatIdData) {
        throw new Error('chatId is undefined');
      }
      const chatId = chatIdData?.chatId;

      return getChatMessages(chatId);
    },
    enabled: !!chatIdData,
    refetchOnMount: true,
    staleTime: 0,
  });
  const addMessageMutation = useMutation({
    mutationFn: ({
      chatId,
      user_message,
    }: {
      chatId: string;
      user_message: string;
    }) => createMessage(chatId, user_message),
  });
  const lastActivityMutation = useMutation({
    mutationFn: ({ chatId }: { chatId: string }) => lastActivity(chatId),
  });
  const handleClick = async () => {
    if (isOpen && chatIdData?.chatId) {
      await lastActivityMutation.mutate({ chatId: chatIdData.chatId });
    }
    setIsOpen(!isOpen);
  };
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Create user message
    const userMessage: Message = {
      messageid: `temp-${Date.now()}`,
      created_at: new Date(),
      role: 'customer',
      content: content,
    };

    // Add user message to message list
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const chatId = chatIdData?.chatId;

      const aiResponse = await addMessageMutation.mutateAsync({
        user_message: content,
        chatId: chatId!,
      });
      const fullContent = aiResponse.reply;

      // Stream the assistant message
      const messageId = `stream-${Date.now()}`;
      let currentIndex = 0;

      setStreamingMessage({
        messageid: messageId,
        created_at: new Date(),
        role: 'agent',
        content: '',
      });

      return new Promise<void>((resolve) => {
        const streamInterval = setInterval(() => {
          if (currentIndex < fullContent.length) {
            setStreamingMessage((prev) =>
              prev
                ? {
                    ...prev,
                    content: fullContent.substring(0, currentIndex + 1),
                  }
                : null
            );
            currentIndex++;
          } else {
            clearInterval(streamInterval);
            setStreamingMessage(null);
            setMessages((prev) => [
              ...prev,
              {
                messageid: messageId,
                created_at: new Date(),
                role: 'agent',
                content: fullContent,
              },
            ]);
            setIsProcessing(false);
            resolve();
          }
        }, 10);
      });
    } catch {
      setIsProcessing(false);
    }
  };
  useEffect(() => {
    if (messagesData) {
      const welcomeMessage: Message = {
        messageid: `temp-${Date.now()}`,
        created_at: new Date(),
        role: 'agent',
        content:
          "Bienvenue 👋 ! Je suis l'assistant virtuel de la Chambre de Commerce et d'Industrie Franco-mexicaine. Comment puis-je vous aider? \n ¡Bienvenido 👋! Soy el asistente virtual de la Cámara de Comercio e Industria Franco-Mexicana. ¿En qué puedo ayudarle?",
      };
      setMessages([welcomeMessage, ...messagesData]);
      setIsProcessing(false);
    }
  }, [messagesData]);

  useEffect(() => {
    const handleUnload = () => {
      if (chatIdData?.chatId) {
        const url = `${BASE_URL}/chat/${chatIdData.chatId}/last_activity`;
        const blob = new Blob([JSON.stringify({})], {
          type: 'application/json',
        });
        navigator.sendBeacon(url, blob);
      }
    };

    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, [chatIdData]);

  const isLoading = isLoadingMessages && !streamingMessage;

  return (
    <>
      <div
        className="fixed bottom-6 right-6 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={handleClick}
          className="bg-[#079cdc] hover:bg-[#05b1fa] cursor-pointer text-white rounded-full p-3 shadow-lg  transition-all duration-200 flex items-center gap-2"
        >
          {lastActivityMutation.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
          {isHovered && !isOpen && (
            <span className="text-sm font-medium animate-fade-in">
              Chat with us
            </span>
          )}
        </button>
      </div>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-background rounded-lg shadow-xl border border-border z-50 transition-all duration-300 animate-slide-up flex flex-col">
          <div className="bg-[#079cdc] flex justify-between items-center h-[50px] px-4 py-2 rounded-t-lg">
            <div className="flex gap-2 items-center">
              <div className="rounded-full bg-white p-1 flex">
                <img src="/cci-logo.png" alt="CCI Logo" className="h-6" />
              </div>
              <div className="text-white text-sm font-semibold">
                Assistant CCI France México
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <ChatMessages
                messages={messages}
                streamingMessage={streamingMessage}
                isProcessing={isProcessing}
              />
            )}
            <ChatInput
              value={inputMessage}
              onChange={setInputMessage}
              onSend={handleSendMessage}
              isLoading={isProcessing}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
