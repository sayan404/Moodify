"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "../providers/ThemeProvider";
import { Home, PlusCircle, Music, Moon, Sun, X, Music4 } from "lucide-react";
import { Fragment } from "react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const navigation = [
    { name: "Create Playlist", href: "/dashboard/create", icon: PlusCircle },
    { name: "Your Playlists", href: "/dashboard/all", icon: Music },
  ];

  const NavLink = ({ item }: { item: typeof navigation[0] }) => (
    <Link
      href={item.href}
      onClick={() => setSidebarOpen(false)}
      className={`group flex items-center gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors ${
        pathname === item.href
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {item.name}
    </Link>
  );

  const sidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-x-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Music4 className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Moodify</h1>
      </div>
      <nav className="flex flex-1 flex-col p-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink item={item} />
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="group -mx-2 flex w-full gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-x-4">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-foreground">
            {session?.user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="truncate">
            <p className="font-semibold text-foreground">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`relative z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-0 flex">
          <div className={`relative mr-16 flex w-full max-w-xs flex-1 transform transition ease-in-out duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background pb-4">
              {sidebarContent}
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:z-40 md:flex md:w-64 md:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background">
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
