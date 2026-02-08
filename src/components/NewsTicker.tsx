import { useState, useEffect } from 'react';
import { useWorldStore } from '../stores/worldStore';

const NewsTicker = () => {
  const { events, broadcastedClaims } = useWorldStore();
  const [currentText, setCurrentText] = useState('');
  const [position, setPosition] = useState(100);

  // Generate ticker text from world events and broadcasts
  const generateTickerText = () => {
    const tickerItems = [
      ...events.slice(-3).map(event => event.description),
      ...broadcastedClaims.slice(-2).map(claim => `BROADCAST: ${claim}`),
      '... STAY TUNED FOR MORE UPDATES ...',
      '... THIS IS THE LAST BROADCAST ...',
    ];

    return tickerItems.join(' • ');
  };

  useEffect(() => {
    const text = generateTickerText();
    setCurrentText(text);
    setPosition(100);
  }, [events, broadcastedClaims]);

  useEffect(() => {
    if (!currentText) return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        const newPosition = prev - 0.5;
        // Reset when text has fully scrolled
        if (newPosition < -100) {
          return 100;
        }
        return newPosition;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentText]);

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden relative">
      {/* Scrolling text */}
      <div 
        className="absolute whitespace-nowrap text-amber-400 text-xs font-mono py-1"
        style={{
          transform: `translateX(${position}%)`,
          transition: 'none',
        }}
      >
        {currentText}
      </div>

      {/* Left fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent z-10" />
      
      {/* Right fade effect */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent z-10" />
    </div>
  );
};

export default NewsTicker;
