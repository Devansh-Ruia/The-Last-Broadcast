import { useState, useEffect } from 'react';

interface VUMeterProps {
  label: string;
}

const VUMeter = ({ label }: VUMeterProps) => {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    // Simulate audio levels with random fluctuations
    const interval = setInterval(() => {
      setLevel(Math.random() * 100);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getNeedleRotation = () => {
    // Map level (0-100) to rotation (-45 to 45 degrees)
    return -45 + (level / 100) * 90;
  };

  const getSegmentColor = (index: number) => {
    const threshold = (index + 1) * 10;
    if (level >= threshold) {
      if (index < 6) return 'bg-green-500';
      if (index < 8) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    return 'bg-gray-700';
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Label */}
      <div className="text-amber-400 text-xs font-mono font-bold">{label}</div>
      
      {/* Meter Body */}
      <div className="relative w-32 h-16 bg-gray-900 border border-gray-700 rounded">
        {/* Level Segments */}
        <div className="absolute inset-x-2 top-2 bottom-2 flex items-center justify-between">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-10 rounded-sm transition-colors duration-100 ${getSegmentColor(i)}`}
            />
          ))}
        </div>
        
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-0.5 h-12 bg-amber-400 origin-bottom transition-transform duration-100"
          style={{
            transform: `translateX(-50%) rotate(${getNeedleRotation()}deg)`,
          }}
        />
        
        {/* Center pivot */}
        <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-amber-400 rounded-full transform -translate-x-1/2" />
      </div>
      
      {/* Scale markings */}
      <div className="flex justify-between w-32 text-gray-600 text-xs font-mono">
        <span>-45</span>
        <span>0</span>
        <span>+45</span>
      </div>
    </div>
  );
};

export default VUMeter;
