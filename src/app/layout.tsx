import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "../components/providers/NextAuthProvider";
import { ThemeProvider } from "../components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sentiment-Aware Playlist Generator",
  description: "Create AI-powered playlists based on your mood",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <NextAuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
