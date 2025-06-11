import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import TypingIndicator from './typing-indicator';
import { User } from 'lucide-react';
import { Message } from '@/lib/types';

interface ChatMessagesProps {
  messages: Message[];
  streamingMessage: Message | null;
  isProcessing: boolean;
}

export function ChatMessages({
  messages,
  streamingMessage,
  isProcessing,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage?.content]);

  const displayMessages = streamingMessage
    ? [...messages, streamingMessage]
    : messages;

  const isErrorMessage = (content: string) => {
    return content.startsWith('Failed');
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="mx-auto space-y-4">
        {displayMessages.map((message) => (
          <div key={message.messageid}>
            <div
              className={cn(
                'flex items-start gap-3 w-full',
                message.role === 'customer' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                {message.role === 'customer' ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                ) : (
                  <img
                    src="/cci-logo.png"
                    alt="CCI Logo"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div
                className={cn(
                  'rounded-lg px-4 py-2 max-w-[80%] markdown-container',
                  message.role === 'customer'
                    ? 'bg-blue-500 text-white'
                    : isErrorMessage(message.content)
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                )}
              >
                <div className="prose prose-sm sm:prose lg:prose-lg prose-blue max-w-none">
                  <div className="leading-relaxed">
                    {message.content.split('||').map((line, index) => (
                      <ReactMarkdown
                        key={index}
                        children={line.trim()}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-xl font-semibold text-gray-900">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-semibold text-gray-900">
                              {children}
                            </h2>
                          ),
                          p: ({ children }) => (
                            <p
                              className={cn(
                                'text-sm leading-[18px] whitespace-pre-wrap',
                                message.role === 'customer'
                                  ? 'text-white'
                                  : isErrorMessage(message.content)
                                  ? 'text-red-600'
                                  : 'text-gray-800',
                                'mb-2'
                              )}
                            >
                              {children}
                            </p>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800 break-words text-sm"
                              onClick={() => {
                                if (href?.includes('calendly.com')) {
                                  console.log('Calendly link clicked:', href);
                                }
                              }}
                            >
                              {children}
                            </a>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside space-y-1 text-gray-800 pl-2">
                              {children}
                            </ul>
                          ),
                          li: ({ children }) => (
                            <li className="pl-1">{children}</li>
                          ),
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isProcessing && !streamingMessage && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
