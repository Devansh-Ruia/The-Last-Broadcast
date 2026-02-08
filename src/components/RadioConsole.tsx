import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useWorldStore } from '../stores/worldStore';
import VUMeter from './VUMeter';
import WindowView from './WindowView';
import CallerPanel from './CallerPanel';
import TranscriptFeed from './TranscriptFeed';
import BroadcastControls from './BroadcastControls';
import PlayerMic from './PlayerMic';
import NewsTicker from './NewsTicker';
import StaticOverlay from './StaticOverlay';

const RadioConsole = () => {
  const { phase, currentCaller, conversation } = useGameStore();
  const { cityCondition } = useWorldStore();

  const showStatic = phase === 'static-break';
  const showCallerPanel = phase === 'caller-connected' || phase === 'player-turn';
  const showPlayerInput = phase === 'player-turn';

  return (
    <div className="w-full h-full flex relative">
      {/* Static overlay for transitions */}
      {showStatic && <StaticOverlay />}
      
      {/* Left 60% - Radio Console */}
      <div className="w-[60%] h-full bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Top - VU Meters */}
        <div className="h-24 bg-gray-900 border-b border-gray-800 flex items-center justify-center space-x-8 px-8">
          <VUMeter label="L" />
          <VUMeter label="R" />
        </div>

        {/* Center - Main Console Area */}
        <div className="flex-1 flex flex-col">
          {/* Caller Panel */}
          {showCallerPanel && currentCaller && (
            <div className="h-48 border-b border-gray-800">
              <CallerPanel caller={currentCaller} />
            </div>
          )}

          {/* Transcript Feed */}
          <div className="flex-1 border-b border-gray-800 overflow-hidden">
            <TranscriptFeed messages={conversation} />
          </div>

          {/* Player Input */}
          {showPlayerInput && (
            <div className="h-32 border-b border-gray-800 p-4">
              <PlayerMic />
            </div>
          )}

          {/* Broadcast Controls */}
          <div className="h-24 p-4">
            <BroadcastControls />
          </div>
        </div>
      </div>

      {/* Right 40% - Window View */}
      <div className="w-[40%] h-full relative">
        <WindowView cityCondition={cityCondition} />
      </div>

      {/* Bottom - News Ticker */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-900 border-t border-gray-800 z-20">
        <NewsTicker />
      </div>
    </div>
  );
};

export default RadioConsole;
