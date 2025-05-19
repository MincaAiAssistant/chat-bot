import { ChatInput } from '@/components/chatbots/chat-input';
import { ChatMessages } from '@/components/chatbots/chat-messages';
import { ClientMessage, CustomerChat, CustomerMessage } from '@/lib/types';
import {
  addClientMessage,
  getClientChatMessages,
  initClientChat,
} from '@/services/client-assistant-services';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const ChatBot = () => {
  const { id } = useParams<{ id: string }>();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ClientMessage[]>([
    {
      messageid: `temp-${Date.now()}`,
      sessionId: 'sessionId',
      created_at: new Date(),
      role: 'assistant',
      content: 'Hi there! How can I help?',
    },
  ]);
  const [streamingMessage, setStreamingMessage] =
    useState<ClientMessage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => getClientChatMessages(id ?? ''),
    enabled: !!id,
    refetchOnMount: true,
    staleTime: 0,
  });

  const initChatMutation = useMutation({
    mutationFn: ({ formData }: { formData: FormData }) =>
      initClientChat(formData),
  });
  const addMessageMutation = useMutation({
    mutationFn: ({ formData, id }: { formData: FormData; id: string }) =>
      addClientMessage(formData, id),
  });

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
      setIsProcessing(false);
    }
  }, [messagesData]);

  // Clear messages when no ID is present
  useEffect(() => {
    if (!id) {
      setMessages([
        {
          messageid: `temp-${Date.now()}`,
          sessionId: 'sessionId',
          created_at: new Date(),
          role: 'assistant',
          content: 'Hi there! How can I help?',
        },
      ]);
      setIsProcessing(false);
    }
  }, [id]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;

    const sessionId = id || 'temp-session';

    // Create user message with attachments
    const userMessage: ClientMessage = {
      messageid: `temp-${Date.now()}`,
      sessionId: sessionId,
      created_at: new Date(),
      role: 'user',
      content: content,
    };

    // Add user message to message list
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('question', content);

      // Append files to FormData
      files?.forEach((file) => {
        formData.append('files', file);
      });

      let aiResponse;
      let initResponse:
        | {
            customer_chat: CustomerChat;
            sessionid: string;
            user: CustomerMessage;
            assistant: CustomerMessage;
          }
        | undefined;
      let fullContent;
      if (!id) {
        initResponse = await initChatMutation.mutateAsync({
          formData: formData,
        });
        fullContent = initResponse.assistant.content;
      } else {
        aiResponse = await addMessageMutation.mutateAsync({
          formData,
          id: id,
        });
        fullContent = aiResponse.assistant.content;
      }

      // Stream the assistant message
      const messageId = `stream-${Date.now()}`;
      let currentIndex = 0;

      setStreamingMessage({
        messageid: messageId,
        sessionId: sessionId,
        created_at: new Date(),
        role: 'assistant',
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
                sessionId: sessionId,
                created_at: new Date(),
                role: 'assistant',
                content: fullContent,
              },
            ]);

            if (!id) {
              if (initResponse) {
                localStorage.setItem('chat-sessionid', initResponse.sessionid);

                navigate(`/${initResponse.sessionid}`);
              }
            }

            setIsProcessing(false);
            resolve();
          }
        }, 10);
      });
    } catch {
      toast.error('Error', {
        description: 'Failed to generate response. Please try again.',
      });
      setIsProcessing(false);
    }
  };

  const handleRefresh = () => {
    localStorage.removeItem('chat-sessionid');
    setMessages([
      {
        messageid: `temp-${Date.now()}`,
        sessionId: 'sessionId',
        created_at: new Date(),
        role: 'assistant',
        content: 'Hi there! How can I help?',
      },
    ]);
    setIsProcessing(false);
    setInputMessage('');
    navigate(`/ `);
  };

  useEffect(() => {
    if (!id) {
      const savedSessionId = localStorage.getItem('chat-sessionid');
      if (savedSessionId) {
        navigate(`/${savedSessionId}`);
      }
    }
  }, [id, navigate]);

  const isLoading = isLoadingMessages && !streamingMessage;

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <div className={`bg-blue-500 flex justify-end h-[50px]`}>
        <button className="cursor-pointer py-2 px-4 justify-center font-semibold text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 chatbot-button my-2 ml-2">
          <RefreshCcw onClick={handleRefresh} width={22} height={22} />
        </button>
      </div>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
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
      </main>
    </main>
  );
};

export default ChatBot;
