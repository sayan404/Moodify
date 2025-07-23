'use client';

import { useEffect, useRef, useState } from 'react';

interface MusicPlayerProps {
  trackUrl: string;
}

const MusicPlayer = ({ trackUrl }: MusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    if (!audioRef.current) return;

    const initializeAudio = () => {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audioRef.current!);
      const analyserNode = context.createAnalyser();
      
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      analyserNode.connect(context.destination);
      
      setAudioContext(context);
      setAnalyser(analyserNode);
    };

    initializeAudio();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const drawVisualizer = () => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(20, 20, 20)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#22c55e'); // Green
        gradient.addColorStop(1, '#4ade80'); // Lighter green
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const togglePlay = async () => {
    if (!audioRef.current || !audioContext) return;

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    } else {
      audioRef.current.play();
      drawVisualizer();
    }
    
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
      <canvas
        ref={canvasRef}
        className="w-full h-32 bg-gray-900 rounded-lg mb-4"
        width={800}
        height={128}
      />
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={togglePlay}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-full text-white"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <audio ref={audioRef} src={trackUrl} />
      </div>
    </div>
  );
};

export default MusicPlayer; 