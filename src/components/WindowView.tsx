import { useState, useEffect, useRef } from 'react';

interface WindowViewProps {
  cityCondition: 'burning' | 'foggy' | 'overrun' | 'calm' | 'dark';
}

const WindowView = ({ cityCondition }: WindowViewProps) => {
  const [previousCondition, setPreviousCondition] = useState(cityCondition);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Handle crossfading between city conditions
  useEffect(() => {
    if (cityCondition !== previousCondition) {
      setIsTransitioning(true);
      
      // Start crossfade animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      const startTime = Date.now();
      const duration = 2000; // 2 seconds crossfade
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setPreviousCondition(cityCondition);
          setIsTransitioning(false);
        }
      };
      
      animate();
    }
  }, [cityCondition, previousCondition]);
  const getBackgroundImage = (condition: string) => {
    switch (condition) {
      case 'burning':
        return 'linear-gradient(to bottom, #1a0000, #330000, #4d0000)';
      case 'foggy':
        return 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)';
      case 'overrun':
        return 'linear-gradient(to bottom, #0d0d0d, #1a1a1a, #2d2d2d)';
      case 'calm':
        return 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)';
      case 'dark':
        return 'linear-gradient(to bottom, #000000, #0a0a0a, #141414)';
      default:
        return 'linear-gradient(to bottom, #0a0a0a, #141414, #1a1a1a)';
    }
  };

  const getFilterStyle = (condition: string) => {
    switch (condition) {
      case 'burning':
        return 'brightness(0.8) contrast(1.2) hue-rotate(-10deg)';
      case 'foggy':
        return 'brightness(0.6) contrast(0.8) blur(1px)';
      case 'overrun':
        return 'brightness(0.4) contrast(1.1) saturate(0.8)';
      case 'calm':
        return 'brightness(0.7) contrast(0.9) saturate(1.1)';
      case 'dark':
        return 'brightness(0.3) contrast(1.0) saturate(0.5)';
      default:
        return 'brightness(0.5) contrast(1.0)';
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Previous background for crossfade */}
      {isTransitioning && (
        <div 
          className="absolute inset-0 transition-opacity duration-2000 ease-in-out"
          style={{
            background: getBackgroundImage(previousCondition),
            filter: getFilterStyle(previousCondition),
            opacity: isTransitioning ? 0.3 : 0,
          }}
        />
      )}
      
      {/* Current background */}
      <div 
        className="absolute inset-0 transition-all duration-2000 ease-in-out"
        style={{
          background: getBackgroundImage(cityCondition),
          filter: getFilterStyle(cityCondition),
          opacity: isTransitioning ? 0.7 : 1,
        }}
      />
      
      {/* Window frame */}
      <div className="absolute inset-0 border-8 border-gray-800 pointer-events-none">
        {/* Window panes */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-700/50"
              style={{
                backdropFilter: 'blur(0.5px)',
              }}
            />
          ))}
        </div>
        
        {/* Window cross */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-700 transform -translate-y-1/2" />
        <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-gray-700 transform -translate-x-1/2" />
        <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-gray-700 transform -translate-x-1/2" />
      </div>

      {/* Atmospheric effects */}
      {cityCondition === 'burning' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-red-500/20 rounded-full blur-xl animate-pulse delay-1000" />
        </div>
      )}

      {cityCondition === 'foggy' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gray-200/10 animate-pulse" />
        </div>
      )}

      {/* Rain effect for dark/overrun */}
      {(cityCondition === 'dark' || cityCondition === 'overrun') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px bg-gray-600/30 animate-pulse"
              style={{
                height: `${Math.random() * 20 + 10}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 1 + 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Occasional searchlight for military presence */}
      {cityCondition === 'overrun' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-yellow-400/10 to-transparent transform rotate-12 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default WindowView;
