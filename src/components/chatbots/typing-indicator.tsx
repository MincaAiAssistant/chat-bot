import { formatTimestamp } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-white text-gray-900 border border-gray-100 rounded-lg p-4 max-w-[80%]">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 mr-2">
            <span>🧑‍💻</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">AI Agent</p>
            <p className="text-xs opacity-70">{formatTimestamp(new Date())}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
