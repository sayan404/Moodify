// "use client";

// import { signIn } from "next-auth/react";
// import { FaSpotify } from "react-icons/fa";
// import { Music4 } from "lucide-react";
// import { useEffect, useRef } from "react";

// const AudioWave = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     // Set canvas size
//     const setCanvasSize = () => {
//       canvas.width = canvas.offsetWidth * window.devicePixelRatio;
//       canvas.height = canvas.offsetHeight * window.devicePixelRatio;
//       ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
//     };

//     setCanvasSize();
//     window.addEventListener('resize', setCanvasSize);

//     let animationId: number;
//     const bars = 50; // Number of bars
//     const barWidth = canvas.width / (bars * 2); // Width of each bar
//     let time = 0;

//     const animate = () => {
//       time += 0.05;
      
//       // Clear canvas
//       ctx.fillStyle = 'transparent';
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       // Draw bars
//       for (let i = 0; i < bars; i++) {
//         const x = i * (barWidth * 2);
        
//         // Create wave effect
//         const height = Math.sin(time + i * 0.2) * 20 + 30;
        
//         // Create gradient
//         const gradient = ctx.createLinearGradient(0, canvas.height - height, 0, canvas.height);
//         gradient.addColorStop(0, '#22c55e'); // Green-500
//         gradient.addColorStop(1, '#4ade80'); // Green-400
        
//         ctx.fillStyle = gradient;
        
//         // Draw bar
//         ctx.beginPath();
//         ctx.roundRect(x, canvas.height - height, barWidth, height, 5);
//         ctx.fill();
//       }

//       animationId = requestAnimationFrame(animate);
//     };

//     animate();

//     return () => {
//       window.removeEventListener('resize', setCanvasSize);
//       cancelAnimationFrame(animationId);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       className="absolute bottom-0 left-0 w-full h-32 opacity-50"
//     />
//   );
// };

// export default function LoginPage() {
//   return (
//     <div className="relative min-h-screen w-full flex items-center justify-center bg-background p-4 overflow-hidden">
//       <div className="relative z-10 w-full max-w-md text-center">
//         <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
//           <Music4 className="h-8 w-8 text-primary-foreground" />
//         </div>
//         <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
//           Welcome to Moodify
//         </h1>
//         <p className="mt-4 text-lg text-muted-foreground">
//           Your personal AI-powered playlist generator. Create the perfect soundtrack for any moment.
//         </p>
//         <div className="mt-10">
//           <button
//             onClick={() => signIn("spotify", { callbackUrl: "/dashboard/create" })}
//             className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-[#1DB954] text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-[#1ed760] transition-all hover:scale-105 hover:shadow-lg"
//           >
//             <FaSpotify className="text-2xl" />
//             <span>Login with Spotify</span>
//           </button>
//         </div>
//       </div>

//       {/* Audio Wave Animation */}
//       <div className="absolute inset-x-0 bottom-0">
//         <AudioWave />
//       </div>

//       {/* Gradient overlay */}
//       <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent pointer-events-none" />
//     </div>
//   );
// }



// TEMPORARY LOGIN PAGE

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { options } from "../../api/auth/[...nextauth]/options"; 
import Link from "next/link";
import { signIn } from "next-auth/react";

export default async function Login() {
  const session = await getServerSession(options);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md space-y-8 p-8 rounded-2xl bg-card shadow-lg backdrop-blur-sm border border-border">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            Welcome to Moodify
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in with your Spotify account to continue
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1DB954] hover:bg-[#1DB954]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1DB954] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Continue with Spotify
          </button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have access yet?{" "}
              <Link 
                href="/" 
                className="font-medium text-primary hover:text-primary/90 transition-colors"
              >
                Request Early Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
