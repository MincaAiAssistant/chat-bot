import { Loader2 } from 'lucide-react';
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
} from './services/client-assistant-services';

function App() {
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
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
  const [isClosing, setIsClosing] = useState(false);

  const { data: chatIdData, error: chatIdError } = useQuery({
    queryKey: ['chatId'],
    queryFn: () => getChatId(),
    refetchOnMount: true,
    staleTime: 0,
  });

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
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

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    setError(null);

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
      const chatId = chatIdData?.chatId;
      if (!chatId) {
        throw new Error('Chat ID is not available');
      }

      const aiResponse = await addMessageMutation.mutateAsync({
        user_message: content,
        chatId: chatId,
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
      setError('Failed to send message. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          messageid: `error-${Date.now()}`,
          created_at: new Date(),
          role: 'agent',
          content: '❌ Failed to send message. Please try again.',
        },
      ]);
    }
  };

  // Combined useEffect for messagesData and error handling
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

    if (chatIdError || messagesError) {
      setError('Failed to load chat. Please refresh the page.');
    }
  }, [messagesData, chatIdError, messagesError]);

  // useEffect for unload event
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
  const isLoading = (isLoadingMessages && !streamingMessage) || isClosing;

  useEffect(() => {
    const allowedOrigins = [
      'https://cci-chat.netlify.app',
      'http://localhost:3000',
      'https://www.franciamexico.com',
    ];

    const handleMessage = (event: MessageEvent) => {
      if (!allowedOrigins.includes(event.origin)) {
        console.warn(
          `Received message from unauthorized origin: ${event.origin}`
        );
        return;
      }

      if (event.data.type === 'CCI_CHAT_CLOSE' && chatIdData?.chatId) {
        setIsClosing(true);
        const url = `${BASE_URL}/chat/${chatIdData.chatId}/last_activity`;
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
          .then((response) => {
            if (!response.ok) {
              setError('Failed to update last activity. Please try again.');
            }
          })
          .catch((err) => {
            console.error('Error calling last_activity API:', err);
            setError('Failed to update last activity. Please try again.');
          })
          .finally(() => {
            setIsClosing(false);
            window.parent.postMessage({ type: 'LOADING_END' }, event.origin);
          });
      }
    };

    window.addEventListener('message', handleMessage);

    window.parent.postMessage(
      { type: isLoading ? 'LOADING_START' : 'LOADING_END' },
      allowedOrigins.includes('https://www.franciamexico.com')
        ? 'https://www.franciamexico.com'
        : 'http://localhost:3000'
    );

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [chatIdData, isLoading]);

  return (
    <>
      <div className="bg-background shadow-xl border border-border z-50 transition-all duration-300 animate-slide-up flex flex-col h-screen w-full">
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 text-sm">
              {error}
            </div>
          )}

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
    </>
  );
}

export default App;
