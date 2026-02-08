import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { gameEngine } from '../engine/GameEngine';

const PlayerMic = () => {
  const [message, setMessage] = useState('');
  const { addMessage, isProcessing } = useGameStore();

  const handleSend = () => {
    if (!message.trim() || isProcessing) return;

    // Add player message to conversation
    addMessage({
      id: `player_${Date.now()}`,
      speaker: 'player',
      text: message.trim(),
      timestamp: Date.now(),
    });

    setMessage('');
    
    // Send to game engine for AI response
    gameEngine.handlePlayerResponse(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex items-center space-x-3">
      {/* Microphone icon */}
      <div className="flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isProcessing 
            ? 'bg-red-900 animate-pulse' 
            : 'bg-amber-900 hover:bg-amber-800'
        } transition-colors`}>
          🎤
        </div>
      </div>

      {/* Input field */}
      <div className="flex-1">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Speak to the caller..."
          disabled={isProcessing}
          className="w-full bg-gray-800 border border-gray-700 text-gray-200 px-4 py-2 rounded font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          maxLength={200}
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!message.trim() || isProcessing}
        className="radio-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        SEND
      </button>

      {/* Character count */}
      <div className="text-gray-600 text-xs font-mono">
        {message.length}/200
      </div>
    </div>
  );
};

export default PlayerMic;
