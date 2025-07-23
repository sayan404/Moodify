"use client";

import { signIn } from "next-auth/react";
import { FaSpotify } from "react-icons/fa";
import { Music4 } from "lucide-react";
import { useEffect, useRef } from "react";

const AudioWave = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    let animationId: number;
    const bars = 50; // Number of bars
    const barWidth = canvas.width / (bars * 2); // Width of each bar
    let time = 0;

    const animate = () => {
      time += 0.05;
      
      // Clear canvas
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bars
      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth * 2);
        
        // Create wave effect
        const height = Math.sin(time + i * 0.2) * 20 + 30;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height - height, 0, canvas.height);
        gradient.addColorStop(0, '#22c55e'); // Green-500
        gradient.addColorStop(1, '#4ade80'); // Green-400
        
        ctx.fillStyle = gradient;
        
        // Draw bar
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - height, barWidth, height, 5);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-0 w-full h-32 opacity-50"
    />
  );
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background p-4 overflow-hidden">
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Music4 className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome to Moodify
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your personal AI-powered playlist generator. Create the perfect soundtrack for any moment.
        </p>
        <div className="mt-10">
          <button
            onClick={() => signIn("spotify", { callbackUrl: "/dashboard/create" })}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-[#1DB954] text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-[#1ed760] transition-all hover:scale-105 hover:shadow-lg"
          >
            <FaSpotify className="text-2xl" />
            <span>Login with Spotify</span>
          </button>
        </div>
      </div>

      {/* Audio Wave Animation */}
      <div className="absolute inset-x-0 bottom-0">
        <AudioWave />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
