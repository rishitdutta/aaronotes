import { UserButton } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUsers, faCog } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-brand-background shadow-sm flex flex-col">
        <div className="p-8">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="AaroNotes"
              width={150}
              height={32}
              className="h-8 w-auto"
            />
          </div>
        </div>
        <nav className="mt-8 flex-1">
          <div className="px-6 space-y-3">
            {" "}
            <Link
              href="/dashboard"
              className="sidebar-btn flex items-center px-6 py-4 text-brand-primary rounded-xl transition-all group"
            >
              <FontAwesomeIcon
                icon={faHome}
                className="w-5 h-5 mr-4 text-brand-icon"
              />
              Dashboard
            </Link>
            <Link
              href="/dashboard/patients"
              className="sidebar-btn flex items-center px-6 py-4 text-brand-primary rounded-xl transition-all group"
            >
              <FontAwesomeIcon
                icon={faUsers}
                className="w-5 h-5 mr-4 text-brand-icon"
              />
              Patients
            </Link>
          </div>
        </nav>{" "}
        {/* Bottom Section with Profile and Settings */}
        <div className="p-6 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
            <Link
              href="/dashboard/settings"
              className="sidebar-btn flex items-center justify-center p-3 text-brand-primary rounded-xl transition-all"
            >
              <FontAwesomeIcon
                icon={faCog}
                className="w-5 h-5 text-brand-icon"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-white">{children}</main>
      </div>
    </div>
  );
}
