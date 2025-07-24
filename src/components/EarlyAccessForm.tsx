"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Music4 } from "lucide-react";

const AudioWave = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    let animationId: number;
    const bars = 60; // Number of bars
    const barWidth = canvas.width / (bars * 2); // Width of each bar
    let time = 0;

    const animate = () => {
      time += 0.03;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bars
      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth * 2);

        // Create wave effect with multiple frequencies
        const height =
          Math.sin(time + i * 0.1) * 15 + // Primary wave
          Math.sin(time * 1.5 + i * 0.05) * 10 + // Secondary wave
          Math.sin(time * 0.5 + i * 0.15) * 5 + // Tertiary wave
          30; // Base height

        // Create gradient
        const gradient = ctx.createLinearGradient(
          0,
          canvas.height - height,
          0,
          canvas.height
        );
        gradient.addColorStop(0, "rgba(34, 197, 94, 0.8)"); // Green-500 with opacity
        gradient.addColorStop(1, "rgba(74, 222, 128, 0.6)"); // Green-400 with opacity

        ctx.fillStyle = gradient;

        // Draw rounded bar
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - height, barWidth, height, 3);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-0 w-full h-40 opacity-60"
    />
  );
};

export default function EarlyAccessForm() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      setStatus("success");
      setMessage(data.message);
      setFormData({ name: "", email: "" });
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-muted overflow-hidden">
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-6 shadow-lg">
            <Music4 className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-8 p-8 rounded-2xl bg-card shadow-lg backdrop-blur-sm border border-border relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/5 to-background/10 pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                Get Early Access
              </h1>
              <p className="text-muted-foreground text-sm">
                Join our exclusive early access list and be among the first to
                experience Moodify.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-input bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-input bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors
                  ${
                    status === "loading" ? "opacity-75 cursor-not-allowed" : ""
                  }`}
              >
                {status === "loading" ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Join Early Access"
                )}
              </button>

              {status !== "idle" && (
                <div
                  className={`mt-4 text-center text-sm ${
                    status === "success" ? "text-green-500" : "text-destructive"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p className="mb-4">
                By signing up, you'll be the first to know when we launch new
                features.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Wave Animation */}
      <AudioWave />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
