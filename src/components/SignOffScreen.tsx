import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useWorldStore } from '../stores/worldStore';
import type { CallerOutcome } from '../types';

const SignOffScreen = () => {
  const [isRevealing, setIsRevealing] = useState(false);
  const { playerCallsign } = useGameStore();
  const { cityCondition, playerReputation, events, callerHistory } = useWorldStore();

  useEffect(() => {
    // Start revealing content after a short delay
    const timer = setTimeout(() => setIsRevealing(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const calculateStats = () => {
    const totalCallers = callerHistory.filter((c: CallerOutcome) => c).length;
    const livesSaved = callerHistory.filter((c: CallerOutcome) => c.survived).length;
    const livesLost = totalCallers - livesSaved;
    const truthBroadcast = playerReputation.honesty > 50 ? Math.floor(playerReputation.honesty / 10) : 0;
    const liesBroadcast = playerReputation.honesty < 50 ? Math.floor((50 - playerReputation.honesty) / 10) : 0;
    
    return {
      totalCallers,
      livesSaved,
      livesLost,
      truthBroadcast,
      liesBroadcast,
      finalCityCondition: cityCondition.toUpperCase(),
      reputationScore: Math.floor((playerReputation.honesty + playerReputation.compassion + playerReputation.boldness) / 3),
    };
  };

  const getRatingMessage = (score: number) => {
    if (score >= 80) return "LEGENDARY BROADCASTER";
    if (score >= 60) return "VOICE OF HOPE";
    if (score >= 40) return "SURVIVOR'S CHOICE";
    if (score >= 20) return "DUTY BOUND";
    return "THE SILENCE";
  };

  const stats = calculateStats();
  const rating = getRatingMessage(stats.reputationScore);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center relative">
      {/* Background static effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 animate-pulse" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto p-8">
        {/* Title */}
        <h1 className="text-5xl font-bold text-amber-400 mb-8 font-display animate-glow">
          BROADCAST ENDED
        </h1>

        {/* Callsign */}
        <div className="text-2xl text-amber-300 font-mono mb-12">
          This was {playerCallsign || 'UNKNOWN'}, signing off.
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 transition-all duration-1000 ${
          isRevealing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="radio-panel text-center">
            <div className="text-3xl font-bold text-amber-400">{stats.totalCallers}</div>
            <div className="text-sm text-gray-400 font-mono">CALLERS</div>
          </div>
          
          <div className="radio-panel text-center">
            <div className="text-3xl font-bold text-green-400">{stats.livesSaved}</div>
            <div className="text-sm text-gray-400 font-mono">LIVES SAVED</div>
          </div>
          
          <div className="radio-panel text-center">
            <div className="text-3xl font-bold text-red-400">{stats.livesLost}</div>
            <div className="text-sm text-gray-400 font-mono">LIVES LOST</div>
          </div>
          
          <div className="radio-panel text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.truthBroadcast}</div>
            <div className="text-sm text-gray-400 font-mono">TRUTHS BROADCAST</div>
          </div>
          
          <div className="radio-panel text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats.liesBroadcast}</div>
            <div className="text-sm text-gray-400 font-mono">LIES BROADCAST</div>
          </div>
          
          <div className="radio-panel text-center">
            <div className="text-3xl font-bold text-purple-400">{stats.reputationScore}%</div>
            <div className="text-sm text-gray-400 font-mono">REPUTATION</div>
          </div>
        </div>

        {/* Final Rating */}
        <div className={`mb-8 transition-all duration-1000 delay-500 ${
          isRevealing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="text-3xl font-bold text-amber-300 font-display mb-2">
            {rating}
          </div>
          <div className="text-lg text-gray-400 font-mono">
            Final City Condition: {stats.finalCityCondition}
          </div>
        </div>

        {/* Final Message */}
        <div className={`text-gray-500 text-sm font-mono max-w-2xl mx-auto transition-all duration-1000 delay-1000 ${
          isRevealing ? 'opacity-100' : 'opacity-0'
        }`}>
          {events.length > 0 && (
            <div className="mb-4">
              <div className="text-amber-400 mb-2">FINAL TRANSMISSION LOG:</div>
              {events.slice(-3).map((event: any, i: number) => (
                <div key={i} className="mb-1">• {event.description}</div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8 text-amber-300">
            The signal fades... but your voice echoes in the darkness.
          </div>
        </div>

        {/* Restart Button */}
        <div className={`mt-12 transition-all duration-1000 delay-1500 ${
          isRevealing ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={() => window.location.reload()}
            className="radio-button text-lg px-8 py-3"
          >
            START NEW BROADCAST
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOffScreen;
