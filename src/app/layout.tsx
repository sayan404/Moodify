import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "../components/providers/NextAuthProvider";

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
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
