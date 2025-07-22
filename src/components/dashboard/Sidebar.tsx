"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "../providers/ThemeProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <>
      <div className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 z-40">
        {/* Logo/Brand Section */}
        <div className="px-6 py-8 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Moodify
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-Powered Playlists</p>
        </div>

        {/* Navigation Links */}
        <nav className="p-4">
          <Link 
            href="/dashboard/create" 
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-all ${
              pathname === '/dashboard/create' 
                ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-lg mr-3">🎼</span>
            <span className="font-medium">Create Playlist</span>
          </Link>

          <Link 
            href="/dashboard/all" 
            className={`flex items-center px-4 py-3 rounded-lg transition-all ${
              pathname === '/dashboard/all' 
                ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-lg mr-3">📚</span>
            <span className="font-medium">Your Playlists</span>
          </Link>

          <button
            onClick={toggleDarkMode}
            className="flex items-center px-4 py-3 rounded-lg transition-all w-full text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span className="text-lg mr-3">{isDarkMode ? '🌞' : '🌙'}</span>
            <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900 text-sm font-medium">
              {session?.user?.name?.[0] || '?'}
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900 dark:text-white">{session?.user?.name || 'User'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                {session?.user?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 