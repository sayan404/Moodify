"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 border-r border-gray-200">
        {/* Logo/Brand Section */}
        <div className="px-6 py-8 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            🎵 Moodify
          </h1>
          <p className="text-sm text-gray-500 mt-1">AI-Powered Playlists</p>
        </div>

        {/* Navigation Links */}
        <nav className="p-6 space-y-2">
          <Link 
            href="/dashboard/create" 
            className={`flex items-center px-4 py-3 rounded-lg transition-all hover:bg-gray-50 group ${
              pathname === '/dashboard/create' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🎼</span>
            <span className="ml-3 font-medium">Create Playlist</span>
          </Link>

          <Link 
            href="/dashboard/all" 
            className={`flex items-center px-4 py-3 rounded-lg transition-all hover:bg-gray-50 group ${
              pathname === '/dashboard/all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📚</span>
            <span className="ml-3 font-medium">Your Playlists</span>
          </Link>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
              {session?.user?.name?.[0] || '?'}
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">{session?.user?.name || 'User'}</p>
              <p className="text-sm text-gray-500 truncate max-w-[180px]">
                {session?.user?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
} 