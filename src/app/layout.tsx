import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "../components/providers/NextAuthProvider";
import { ThemeProvider } from "../components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Moodify - AI Playlist Generator",
  description: "Create AI-powered playlists based on your mood",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          storageKey="moodify-theme"
        >
          <NextAuthProvider>
            {children}
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
