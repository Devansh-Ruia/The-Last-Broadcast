import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { gameEngine } from '../engine/GameEngine';

const SignOnScreen = () => {
  const [callsign, setCallsign] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { setPlayerCallsign, setPhase } = useGameStore();

  const handleStart = () => {
    if (!callsign.trim()) return;
    
    setIsConnecting(true);
    
    // Simulate connection delay with static effect
    setTimeout(() => {
      setPlayerCallsign(callsign.trim());
      setPhase('broadcasting');
      // Start the game engine
      gameEngine.startGame();
    }, 2000);
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-black relative">
      {/* Static overlay effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 animate-pulse" />
      </div>
      
      <div className="relative z-10 text-center max-w-2xl mx-auto p-8">
        <h1 className="text-6xl font-bold text-amber-400 mb-8 font-display animate-glow">
          THE LAST BROADCAST
        </h1>
        
        <div className="mb-12">
          <p className="text-gray-400 text-lg mb-4">
            In the darkness after the end, one voice remains.
          </p>
          <p className="text-gray-500 text-sm">
            You are the last radio host. Your words will shape what remains.
          </p>
        </div>

        {!isConnecting ? (
          <div className="space-y-6">
            <div>
              <label htmlFor="callsign" className="block text-amber-300 text-sm font-mono mb-2">
                ENTER YOUR CALLSIGN:
              </label>
              <input
                id="callsign"
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                placeholder="e.g., NightHawk, Echo-7, The Voice"
                className="w-full bg-gray-900 border border-amber-600 text-amber-400 px-4 py-3 rounded font-mono text-center focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                maxLength={20}
              />
            </div>
            
            <button
              onClick={handleStart}
              disabled={!callsign.trim()}
              className="radio-button text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SIGN ON
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-amber-400 font-mono text-lg animate-pulse">
              Connecting to broadcast tower...
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-150" />
            </div>
            <div className="text-gray-500 text-sm font-mono">
              This is {callsign || 'Unknown'}, signing on...
            </div>
          </div>
        )}
        
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-gray-600 text-xs font-mono">
            48-Hour Hackathon Project • Made with React & TypeScript
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignOnScreen;
