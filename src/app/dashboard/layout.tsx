import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex">
      {/* Sidebar */}
      <div>
        <div className="fixed top-6 left-6 z-50 bg-white border rounded-full p-2 shadow-md">
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800"></span>
        </div>
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-40">
          <div className="flex flex-col h-full p-6 gap-4">
            <Link href="/dashboard/create" className="text-left px-4 py-2 rounded hover:bg-gray-100 font-semibold text-lg">Create Playlist</Link>
            <Link href="/dashboard/all" className="text-left px-4 py-2 rounded hover:bg-gray-100 font-semibold text-lg">Checkout All Playlists</Link>
            <Link href="/dashboard/merge" className="text-left px-4 py-2 rounded hover:bg-gray-100 font-semibold text-lg">Merge Playlists</Link>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto flex-1">
        {children}
      </div>
    </div>
  );
} 