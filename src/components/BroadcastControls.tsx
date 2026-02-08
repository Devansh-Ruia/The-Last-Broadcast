import { useGameStore } from '../stores/gameStore';
import { gameEngine } from '../engine/GameEngine';
import { audioManager } from '../services/audioManager';
import type { PlayerChoice } from '../types';

const BroadcastControls = () => {
  const { phase, currentCaller, isProcessing, setPhase, setIsProcessing } = useGameStore();

  const handleChoice = async (choice: PlayerChoice) => {
    if (!currentCaller || isProcessing) return;
    
    setIsProcessing(true);
    
    // Play button click sound
    audioManager.playButtonClick();
    
    // Process the choice through game engine
    gameEngine.processPlayerChoice(choice);
  };

  const canAnswer = phase === 'caller-connected' && currentCaller && !isProcessing;
  const canChoose = phase === 'player-turn' && currentCaller && !isProcessing;

  return (
    <div className="h-full flex items-center justify-center space-x-4">
      {canAnswer && (
        <button
          onClick={() => setPhase('player-turn')}
          className="radio-button text-lg px-6 py-3 animate-glow"
        >
          📞 ANSWER CALL
        </button>
      )}

      {canChoose && (
        <>
          <button
            onClick={() => handleChoice('broadcast')}
            disabled={isProcessing}
            className="radio-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📻 BROADCAST
          </button>
          
          <button
            onClick={() => handleChoice('help')}
            disabled={isProcessing}
            className="radio-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💬 HELP
          </button>
          
          <button
            onClick={() => handleChoice('ignore')}
            disabled={isProcessing}
            className="radio-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❌ IGNORE
          </button>
          
          <button
            onClick={() => handleChoice('expose')}
            disabled={isProcessing}
            className="radio-button-danger disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⚠️ EXPOSE
          </button>
        </>
      )}

      {isProcessing && (
        <div className="text-amber-400 font-mono text-sm animate-pulse">
          Processing transmission...
        </div>
      )}

      {!currentCaller && !isProcessing && (
        <div className="text-gray-600 font-mono text-sm">
          Awaiting incoming call...
        </div>
      )}
    </div>
  );
};

export default BroadcastControls;
