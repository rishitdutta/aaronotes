import { currentUser } from "@clerk/nextjs/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGroup,
  faStethoscope,
  faCalendarCheck,
  faMicrophone,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { db } from "@/lib/db";

interface EncounterData {
  id: string;
  createdAt: Date;
  title: string | null;
  status: string;
}

interface PatientData {
  encounters: EncounterData[];
}

export default async function DashboardPage() {
  console.log("Dashboard page accessed");

  const user = await currentUser();
  console.log("User from Clerk:", user ? "Found" : "Not found");

  if (!user) {
    return <div>Loading...</div>;
  }

  try {
    console.log("Attempting database connection...");
    // Get or create user in our database
    let dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: {
        patients: {
          include: {
            encounters: true,
          },
        },
      },
    }); // If user doesn't exist in our database, create them
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
        },
        include: {
          patients: {
            include: {
              encounters: true,
            },
          },
        },
      });
    } // Calculate statistics
    const totalPatients = dbUser.patients?.length || 0;
    const totalEncounters =
      dbUser.patients?.reduce(
        (sum: number, patient: PatientData) =>
          sum + (patient.encounters?.length || 0),
        0
      ) || 0;
    const recentEncounters =
      dbUser.patients
        ?.flatMap((patient: PatientData) => patient.encounters || [])
        .sort(
          (a: EncounterData, b: EncounterData) =>
            b.createdAt.getTime() - a.createdAt.getTime()
        )
        .slice(0, 5) || [];
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-primary mb-3">
            Welcome back, Dr.{" "}
            {user.firstName || user.emailAddresses?.[0]?.emailAddress || "User"}
          </h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your patients today.
          </p>
        </div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-brand-primary">
                Total Patients
              </CardTitle>
              <FontAwesomeIcon
                icon={faUserGroup}
                className="w-4 h-4 text-brand-icon"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-primary">
                {totalPatients}
              </div>
              <p className="text-xs text-gray-600">Active patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-brand-primary">
                Total Encounters
              </CardTitle>
              <FontAwesomeIcon
                icon={faStethoscope}
                className="w-4 h-4 text-brand-icon"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-primary">
                {totalEncounters}
              </div>
              <p className="text-xs text-gray-600">Clinical notes created</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-brand-primary">
                This Week
              </CardTitle>
              <FontAwesomeIcon
                icon={faCalendarCheck}
                className="w-4 h-4 text-brand-icon"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-primary">
                {
                  recentEncounters.filter((e: EncounterData) => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return e.createdAt > weekAgo;
                  }).length
                }
              </div>
              <p className="text-xs text-gray-600">New encounters</p>
            </CardContent>
          </Card>{" "}
        </div>{" "}
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-6">
              <CardTitle className="text-brand-primary text-lg">
                Quick Actions
              </CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href="/dashboard/patients"
                className="flex items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FontAwesomeIcon
                  icon={faUserGroup}
                  className="w-5 h-5 text-brand-icon mr-4"
                />
                <div>
                  <div className="font-medium text-brand-primary">
                    Manage Patients
                  </div>
                  <div className="text-sm text-gray-600">
                    View and add new patients
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-6">
              <CardTitle className="text-brand-primary text-lg">
                Start New Encounter
              </CardTitle>
              <CardDescription>Begin recording or upload audio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href="/dashboard/encounters/new"
                className="flex items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors w-full"
              >
                <FontAwesomeIcon
                  icon={faMicrophone}
                  className="w-5 h-5 text-brand-icon mr-4"
                />
                <div className="text-left">
                  <div className="font-medium text-brand-primary">
                    Start Recording
                  </div>
                  <div className="text-sm text-gray-600">
                    Record live audio encounter
                  </div>
                </div>
              </Link>
              <Link
                href="/dashboard/encounters/new"
                className="flex items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors w-full"
              >
                <FontAwesomeIcon
                  icon={faUpload}
                  className="w-5 h-5 text-brand-icon mr-4"
                />
                <div className="text-left">
                  <div className="font-medium text-brand-primary">
                    Upload Recording
                  </div>
                  <div className="text-sm text-gray-600">
                    Upload existing audio file
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-6">
              <CardTitle className="text-brand-primary text-lg">
                Recent Encounters
              </CardTitle>
              <CardDescription>Latest clinical notes</CardDescription>
            </CardHeader>
            <CardContent>
              {" "}
              {recentEncounters.length > 0 ? (
                <div className="space-y-3">
                  {recentEncounters
                    .slice(0, 3)
                    .map((encounter: EncounterData) => (
                      <div
                        key={encounter.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-brand-primary">
                            {encounter.title || "Untitled Encounter"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {encounter.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-xs px-2 py-1 bg-gray-100 rounded text-brand-primary">
                          {encounter.status}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No encounters yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Database Connection Error
          </h2>
          <p className="text-red-700 mb-4">
            Unable to connect to the database. This is likely because the
            database is not set up yet.
          </p>
          <div className="text-sm text-red-600">
            <p>To fix this:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Set up a PostgreSQL database</li>
              <li>Update DATABASE_URL in .env.local</li>
              <li>Run: npx prisma migrate dev</li>
              <li>Run: npx prisma generate</li>
            </ol>{" "}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          {" "}
          <h3 className="text-lg font-semibold text-brand-primary mb-2">
            Welcome to AaroNotes!
          </h3>
          <p className="text-blue-700">
            You&apos;ve successfully signed up. Complete the database setup to
            start managing patients and clinical notes.
          </p>
        </div>
      </div>
    );
  }
}
