"use client";

import { Menu } from "lucide-react";

interface HeaderProps {
    setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
    return (
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-6 border-b bg-background/80 backdrop-blur-sm px-4 shadow-sm sm:px-6 md:hidden">
            <button type="button" className="-m-2.5 p-2.5 text-muted-foreground" onClick={() => setSidebarOpen(true)}>
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 text-lg font-semibold leading-6 text-foreground">
                Moodify
            </div>
        </div>
    );
}
