import { Loader2 } from 'lucide-react';
import { ChatInput } from './components/chatbots/chat-input';
import { ChatMessages } from './components/chatbots/chat-messages';
import { useEffect, useState } from 'react';
import { Message } from './lib/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  BASE_URL,
  createChatId,
  createMessage,
  getChatMessages,
} from './services/client-assistant-services';

function App() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      messageid: `temp-${Date.now()}`,
      created_at: new Date(),
      role: 'agent',
      content:
        "Bienvenue 👋 ! Je suis l'assistant virtuel de la Chambre de Commerce et d'Industrie Franco-mexicaine. Comment puis-je vous aider? || ¡Bienvenido 👋! Soy el asistente virtual de la Cámara de Comercio e Industria Franco-Mexicana. ¿En qué puedo ayudarle?",
    },
  ]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatId, setChatId] = useState<string | null>(() =>
    sessionStorage.getItem('chatId')
  );

  useEffect(() => {
    const initializeChatId = async () => {
      if (!sessionStorage.getItem('chatId')) {
        try {
          const { chatId } = await createChatId();
          sessionStorage.setItem('chatId', chatId);
          setChatId(chatId);
        } catch (error) {
          console.error('Failed to create chatId:', error);
          // Optionally set a fallback or error message
          setMessages((prev) => [
            ...prev,
            {
              messageid: `error-${Date.now()}`,
              created_at: new Date(),
              role: 'agent',
              content: 'Failed to initialize chat. Please try again.',
            },
          ]);
        }
      }
    };
    initializeChatId();
  }, []);

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => {
      if (!chatId) {
        throw new Error('chatId is undefined');
      }
      return getChatMessages(chatId);
    },
    enabled: !!chatId,
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

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const sessionChatId = sessionStorage.getItem('chatId');
    if (!sessionChatId) {
      try {
        const { chatId } = await createChatId();
        sessionStorage.setItem('chatId', chatId);
        setChatId(chatId);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            messageid: `error-${Date.now()}`,
            created_at: new Date(),
            role: 'agent',
            content: 'Failed to initialize chat. Please try again.',
          },
        ]);
        return;
      }
    }

    const userMessage: Message = {
      messageid: `temp-${Date.now()}`,
      created_at: new Date(),
      role: 'customer',
      content: content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const chatIdToUse = sessionStorage.getItem('chatId');
      if (!chatIdToUse) throw new Error('Chat ID missing from session');

      const aiResponse = await addMessageMutation.mutateAsync({
        user_message: content,
        chatId: chatIdToUse,
      });
      const fullContent = aiResponse.reply;

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
        }, 2);
      });
    } catch {
      setIsProcessing(false);
      setMessages((prev) => [
        ...prev,
        {
          messageid: `error-${Date.now()}`,
          created_at: new Date(),
          role: 'agent',
          content: 'Failed to send message. Please try again.',
        },
      ]);
    }
  };

  useEffect(() => {
    if (messagesData) {
      const welcomeMessage: Message = {
        messageid: `temp-${Date.now()}`,
        created_at: new Date(),
        role: 'agent',
        content:
          "Bienvenue 👋 ! Je suis l'assistant virtuel de la Chambre de Commerce et d'Industrie Franco-mexicaine. Comment puis-je vous aider? || ¡Bienvenido 👋! Soy el asistente virtual de la Cámara de Comercio e Industria Franco-Mexicana. ¿En qué puedo ayudarle?",
      };
      setMessages([welcomeMessage, ...messagesData]);
      setIsProcessing(false);
    }
  }, [messagesData, messagesError]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionChatId = sessionStorage.getItem('chatId');
      if (sessionChatId) {
        const url = `${BASE_URL}/chat/${sessionChatId}/last_activity`;
        const blob = new Blob([JSON.stringify({})], {
          type: 'application/json',
        });
        navigator.sendBeacon(url, blob);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const isLoading = isLoadingMessages && !streamingMessage;

  return (
    <div className="bg-background shadow-xl z-50 transition-all duration-300 animate-slide-up flex flex-col h-screen w-full">
      <div className="bg-[#079cdc] flex justify-between items-center h-[50px] px-4 py-2 flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto">
            <ChatMessages
              messages={messages}
              streamingMessage={streamingMessage}
              isProcessing={isProcessing}
            />
          </div>
        )}

        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={handleSendMessage}
          isLoading={isProcessing}
        />
      </div>
    </div>
  );
}

export default App;
