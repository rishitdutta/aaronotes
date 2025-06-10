import { UserButton } from "@clerk/nextjs";
import { Stethoscope, Users, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">AaroNotes</h1>
          </div>
        </div>

        <nav className="mt-6">
          <div className="px-3">
            <Link
              href="/dashboard"
              className="flex items-center px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 group"
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </Link>

            <Link
              href="/dashboard/patients"
              className="flex items-center px-3 py-2 mt-2 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 group"
            >
              <Users className="h-5 w-5 mr-3" />
              Patients
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Clinical Documentation
              </h2>
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
