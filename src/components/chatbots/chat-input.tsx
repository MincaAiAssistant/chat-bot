import { FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon, Loader2 } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  isLoading?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the right scrollHeight
    textarea.style.height = '56px';

    // Set height based on scrollHeight (with a max height)
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 56), 192);
    textarea.style.height = `${newHeight}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        handleSubmitMessage();
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      handleSubmitMessage();
    }
  };

  const handleSubmitMessage = () => {
    onSend(value);
  };

  return (
    <div className="border-gray-200 bg-gray-50 px-5 pt-2 pb-1">
      <div className="mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-md shadow-md border border-gray-200 bg-white overflow-hidden"
        >
          <div className="bg-white rounded-md">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question"
              className="min-h-[56px] max-h-[192px] resize-none !text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 bg-transparent"
              style={{ overflow: 'auto' }}
              disabled={isLoading}
            />
          </div>

          <div className="absolute right-4 bottom-3 flex items-center gap-2 z-10 bg-white rounded-full shadow-sm">
            <Button
              type="submit"
              disabled={value.trim() === '' || isLoading}
              className="rounded-full h-9 w-9 p-0 flex items-center justify-center bg-sky-500 hover:bg-sky-600 "
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendIcon className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
        </form>

        <div className="py-2.5 text-[13px] text-gray-900 text-center"></div>
      </div>
    </div>
  );
}
