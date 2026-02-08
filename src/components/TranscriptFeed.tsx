import { useEffect, useRef } from 'react';
import type { ConversationMessage } from '../types';

interface TranscriptFeedProps {
  messages: ConversationMessage[];
}

const TranscriptFeed = ({ messages }: TranscriptFeedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full bg-gray-900/50 p-4 overflow-hidden">
      <div 
        ref={scrollRef}
        className="h-full overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
      >
        {messages.length === 0 ? (
          <div className="text-gray-600 text-center font-mono text-sm mt-8">
            Awaiting transmission...
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.speaker === 'player' ? 'justify-end' : 'justify-start'
              } animate-fadeIn`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg font-mono text-sm ${
                  message.speaker === 'player'
                    ? 'bg-amber-900/30 border border-amber-700/50 text-amber-200'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-200'
                }`}
              >
                {/* Speaker label */}
                <div className={`text-xs mb-1 font-bold ${
                  message.speaker === 'player' ? 'text-amber-400' : 'text-gray-400'
                }`}>
                  {message.speaker === 'player' ? '>> HOST' : '<< CALLER'}
                </div>
                
                {/* Message content */}
                <div className="whitespace-pre-wrap break-words">
                  {message.text}
                </div>
                
                {/* Timestamp */}
                <div className="text-xs mt-1 opacity-60">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranscriptFeed;
