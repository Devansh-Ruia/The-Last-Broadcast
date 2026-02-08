import { useEffect, useRef } from 'react';

const StaticOverlay = ({ intensity = 0.3 }: { intensity?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    // Static animation with enhanced effects
    let animationId: number;
    const animate = () => {
      timeRef.current += 0.01;
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      // Generate animated static with time-based patterns
      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        
        // Create more complex static patterns
        const noise1 = Math.random() * 50 * intensity;
        const noise2 = Math.sin(x * 0.01 + timeRef.current) * 20 * intensity;
        const noise3 = Math.cos(y * 0.01 + timeRef.current) * 20 * intensity;
        
        const combinedNoise = (noise1 + noise2 + noise3) / 3;
        
        data[i] = combinedNoise;     // Red
        data[i + 1] = combinedNoise; // Green
        data[i + 2] = combinedNoise; // Blue
        data[i + 3] = 255 * intensity;   // Alpha with intensity
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <canvas
        ref={canvasRef}
        className="w-full h-full mix-blend-screen"
        style={{ opacity: intensity }}
      />
      
      {/* Additional overlay for effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent animate-pulse" />
    </div>
  );
};

export default StaticOverlay;
