import type { Caller } from '../types';

interface CallerPanelProps {
  caller: Caller;
}

const CallerPanel = ({ caller }: CallerPanelProps) => {
  const getTrustLevel = () => {
    if (caller.trustworthiness >= 0.7) return { color: 'bg-green-500', label: 'HIGH' };
    if (caller.trustworthiness >= 0.4) return { color: 'bg-yellow-500', label: 'MED' };
    return { color: 'bg-red-500', label: 'LOW' };
  };

  const trustLevel = getTrustLevel();

  return (
    <div className="radio-panel h-full flex items-center space-x-4">
      {/* Portrait */}
      <div className="relative">
        <div className="w-24 h-24 bg-gray-800 rounded-lg border-2 border-gray-600 flex items-center justify-center">
          {/* Placeholder silhouette */}
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-500">👤</span>
          </div>
        </div>
        
        {/* Connection indicator */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
      </div>

      {/* Caller Info */}
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="text-xl font-bold text-amber-400 font-mono">
            {caller.name}
          </h3>
          <span className="text-gray-500 text-sm font-mono">
            Age: {caller.age}
          </span>
        </div>

        {/* Archetype */}
        <div className="text-gray-400 text-sm font-mono mb-3">
          {caller.archetype.replace('_', ' ').toUpperCase()}
        </div>

        {/* Trust Meter */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-xs font-mono">SIGNAL:</span>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-4 rounded-sm ${
                  i < Math.ceil(caller.trustworthiness * 5)
                    ? trustLevel.color
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <span className={`text-xs font-mono ${
            trustLevel.color === 'bg-green-500' ? 'text-green-400' :
            trustLevel.color === 'bg-yellow-500' ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {trustLevel.label}
          </span>
        </div>
      </div>

      {/* Emotional State Indicator */}
      <div className="text-right">
        <div className="text-gray-500 text-xs font-mono mb-1">STATUS</div>
        <div className="text-amber-300 text-sm font-mono capitalize">
          {caller.emotionalState}
        </div>
      </div>
    </div>
  );
};

export default CallerPanel;
