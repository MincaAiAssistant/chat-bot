import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { ClientMessage } from '@/lib/types';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import TypingIndicator from './typing-indicator';

interface ChatMessagesProps {
  messages: ClientMessage[];
  streamingMessage: ClientMessage | null;
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

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="mx-auto space-y-4">
        {displayMessages.map((message) => (
          <div key={message.messageid}>
            <div
              className={cn(
                'flex flex-col w-full',
                message.role === 'user'
                  ? 'justify-self-end place-items-end'
                  : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'rounded-md px-4 py-2',
                  message.role === 'user'
                    ? 'bg-blue-500 text-white max-w-[80%]'
                    : 'text-gray-900  bg-[#f7f8ff] max-w-[100%] w-fit'
                )}
              >
                <div className="prose prose-sm sm:prose lg:prose-lg prose-blue max-w-none">
                  <div className="leading-relaxed space-y-4">
                    <ReactMarkdown
                      children={message.content}
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
                            className={`${
                              message.role === 'user'
                                ? 'text-white'
                                : 'text-gray-800'
                            }`}
                          >
                            {children}
                          </p>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Show typing indicator when processing but not streaming yet */}
        {isProcessing && !streamingMessage && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
