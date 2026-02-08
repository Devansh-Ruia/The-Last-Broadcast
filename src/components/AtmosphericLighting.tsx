import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

interface AtmosphericLightingProps {
  cityCondition: 'burning' | 'foggy' | 'overrun' | 'calm' | 'dark';
}

const AtmosphericLighting = ({ cityCondition }: AtmosphericLightingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { phase } = useGameStore();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    const animate = () => {
      timeRef.current += 0.005;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply different lighting effects based on city condition
      switch (cityCondition) {
        case 'burning':
          drawFireEffect(ctx, canvas, timeRef.current);
          break;
        case 'foggy':
          drawFogEffect(ctx, canvas, timeRef.current);
          break;
        case 'overrun':
          drawSearchlightEffect(ctx, canvas, timeRef.current);
          break;
        case 'calm':
          drawMoonlightEffect(ctx, canvas, timeRef.current);
          break;
        case 'dark':
          drawDarknessEffect(ctx, canvas, timeRef.current);
          break;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [cityCondition]);

  const drawFireEffect = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    // Animated fire glow
    const gradient = ctx.createRadialGradient(
      canvas.width * 0.7, 
      canvas.height * 0.3, 
      0,
      canvas.width * 0.7, 
      canvas.height * 0.3, 
      canvas.width * 0.4
    );
    
    const intensity = 0.3 + Math.sin(time * 2) * 0.1;
    gradient.addColorStop(0, `rgba(255, 100, 0, ${intensity})`);
    gradient.addColorStop(0.3, `rgba(255, 50, 0, ${intensity * 0.7})`);
    gradient.addColorStop(0.6, `rgba(200, 0, 0, ${intensity * 0.3})`);
    gradient.addColorStop(1, 'rgba(100, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Flickering embers
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = canvas.height * 0.5 + Math.random() * canvas.height * 0.5;
      const size = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.5 + 0.2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 150, 0, ${opacity})`;
      ctx.fill();
    }
  };

  const drawFogEffect = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    // Moving fog layers
    for (let layer = 0; layer < 3; layer++) {
      const offset = time * (0.5 + layer * 0.2) * (layer % 2 === 0 ? 1 : -1);
      const opacity = 0.1 - layer * 0.02;
      
      const gradient = ctx.createLinearGradient(
        (offset * 100) % canvas.width - canvas.width,
        0,
        (offset * 100) % canvas.width,
        canvas.height
      );
      
      gradient.addColorStop(0, `rgba(200, 200, 200, 0)`);
      gradient.addColorStop(0.5, `rgba(180, 180, 180, ${opacity})`);
      gradient.addColorStop(1, `rgba(200, 200, 200, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const drawSearchlightEffect = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    // Rotating searchlights
    const numLights = 3;
    for (let i = 0; i < numLights; i++) {
      const angle = time * 0.3 + (i * Math.PI * 2 / numLights);
      const centerX = canvas.width * (0.2 + i * 0.3);
      const centerY = 0;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-50, 0);
      ctx.lineTo(50, 0);
      ctx.lineTo(200, canvas.height);
      ctx.lineTo(-200, canvas.height);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
  };

  const drawMoonlightEffect = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    // Subtle moonlight
    const moonX = canvas.width * 0.8;
    const moonY = canvas.height * 0.2;
    
    const gradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, canvas.width * 0.6);
    gradient.addColorStop(0, 'rgba(200, 200, 255, 0.2)');
    gradient.addColorStop(0.5, 'rgba(150, 150, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Twinkling stars
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % canvas.width;
      const y = (i * 37) % canvas.height;
      const twinkle = Math.sin(time * 3 + i) * 0.5 + 0.5;
      
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
      ctx.fill();
    }
  };

  const drawDarknessEffect = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    // oppressive darkness with subtle movement
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, 
      canvas.height / 2, 
      0,
      canvas.width / 2, 
      canvas.height / 2, 
      Math.max(canvas.width, canvas.height) * 0.7
    );
    
    const pulse = 0.8 + Math.sin(time * 0.5) * 0.1;
    gradient.addColorStop(0, `rgba(0, 0, 0, ${pulse})`);
    gradient.addColorStop(0.5, `rgba(10, 0, 20, ${pulse * 0.8})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Adjust intensity based on game phase
  const getIntensity = () => {
    switch (phase) {
      case 'caller-connected':
      case 'player-turn':
        return 0.7; // More intense during calls
      case 'static-break':
        return 0.3; // Calmer during breaks
      default:
        return 0.5;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ opacity: getIntensity(), mixBlendMode: 'screen' }}
      />
    </div>
  );
};

export default AtmosphericLighting;
