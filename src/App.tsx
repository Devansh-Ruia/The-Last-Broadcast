import { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import { useWorldStore } from './stores/worldStore';
import SignOnScreen from './components/SignOnScreen';
import RadioConsole from './components/RadioConsole';
import SignOffScreen from './components/SignOffScreen';

function App() {
  const { phase, resetGame } = useGameStore();
  const { resetWorld } = useWorldStore();

  useEffect(() => {
    // Reset game state on component mount
    resetGame();
    resetWorld();
  }, [resetGame, resetWorld]);

  const renderPhase = () => {
    switch (phase) {
      case 'sign-on':
        return <SignOnScreen />;
      case 'broadcasting':
      case 'caller-connected':
      case 'player-turn':
      case 'static-break':
        return <RadioConsole />;
      case 'sign-off':
        return <SignOffScreen />;
      default:
        return <SignOnScreen />;
    }
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      {renderPhase()}
    </div>
  );
}

export default App;
