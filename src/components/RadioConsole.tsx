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
import AtmosphericLighting from './AtmosphericLighting';

const RadioConsole = () => {
  const { phase, currentCaller, conversation } = useGameStore();
  const { cityCondition } = useWorldStore();

  const showStatic = phase === 'static-break';
  const showCallerPanel = phase === 'caller-connected' || phase === 'player-turn';
  const showPlayerInput = phase === 'player-turn';

  return (
    <div className="w-full h-full bg-gray-900 relative overflow-hidden">
      {/* Atmospheric lighting effects */}
      <AtmosphericLighting cityCondition={cityCondition} />
      
      {/* Main layout */}
      <div className="flex flex-col lg:flex-row h-full">
        {/* Window view - 60% on desktop, full on mobile */}
        <div className="lg:w-3/5 h-1/2 lg:h-full relative">
          <WindowView cityCondition={cityCondition} />
          
          {/* Static overlay during breaks */}
          {showStatic && <StaticOverlay intensity={0.4} />}
        </div>

        {/* Radio console - 40% on desktop, full on mobile */}
        <div className="lg:w-2/5 h-1/2 lg:h-full bg-gray-800 border-l border-gray-700 relative overflow-hidden">
          {/* Console panels */}
          <div className="grid grid-cols-2 grid-rows-3 gap-1 p-2 h-full">
            {/* VU Meters */}
            <div className="bg-gray-900 rounded border border-gray-600 p-2">
              <VUMeter label="L" />
            </div>
            <div className="bg-gray-900 rounded border border-gray-600 p-2">
              <VUMeter label="R" />
            </div>

            {/* Caller Panel */}
            {showCallerPanel && currentCaller && (
              <div className="col-span-2 bg-gray-900 rounded border border-gray-600 p-2">
                <CallerPanel caller={currentCaller} />
              </div>
            )}

            {/* Transcript Feed */}
            <div className="col-span-2 bg-gray-900 rounded border border-gray-600 p-2 flex flex-col">
              <div className="text-xs text-gray-400 mb-1 font-mono">TRANSCRIPT</div>
              <div className="flex-1 overflow-y-auto">
                <TranscriptFeed messages={conversation} />
              </div>
            </div>

            {/* Controls */}
            <div className="col-span-2 bg-gray-900 rounded border border-gray-600 p-2">
              <BroadcastControls />
            </div>

            {/* Player Input */}
            {showPlayerInput && (
              <div className="col-span-2 bg-gray-900 rounded border border-gray-600 p-2">
                <PlayerMic />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* News ticker at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-900 border-t border-gray-700">
        <NewsTicker />
      </div>
    </div>
  );
};

export default RadioConsole;
