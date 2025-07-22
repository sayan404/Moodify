import Sidebar from "../../components/dashboard/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {children}
      </div>
    </div>
  );
} 