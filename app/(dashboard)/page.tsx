import { currentUser } from "@clerk/nextjs/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";

// Type imports
type Patient = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  dateOfBirth: Date | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  medicalHistory: string | null;
  encounters: Encounter[];
  userId: string;
};

type Encounter = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rawTranscript: string | null;
  structuredNote: object | null;
  status: string;
  title: string | null;
  duration: number | null;
  patientId: string;
};

type PatientWithEncounters = Patient & {
  encounters: Encounter[];
};

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
    });

    // If user doesn't exist in our database, create them
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
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
    }

    // Calculate statistics
    const totalPatients = dbUser.patients.length;
    const totalEncounters = dbUser.patients.reduce(
      (sum: number, patient: PatientWithEncounters) =>
        sum + patient.encounters.length,
      0
    );
    const recentEncounters = dbUser.patients
      .flatMap((patient: PatientWithEncounters) => patient.encounters)
      .sort(
        (a: Encounter, b: Encounter) =>
          b.createdAt.getTime() - a.createdAt.getTime()
      )
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Dr.{" "}
            {user.firstName || user.emailAddresses[0].emailAddress}
          </h1>
          <p className="text-gray-600 mt-2">
            Here&apos;s what&apos;s happening with your patients today.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Patients
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatients}</div>
              <p className="text-xs text-gray-600">Active patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Encounters
              </CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEncounters}</div>
              <p className="text-xs text-gray-600">Clinical notes created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  recentEncounters.filter((e: Encounter) => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return e.createdAt > weekAgo;
                  }).length
                }
              </div>
              <p className="text-xs text-gray-600">New encounters</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/dashboard/patients"
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium">Manage Patients</div>
                  <div className="text-sm text-gray-600">
                    View and add new patients
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Encounters</CardTitle>
              <CardDescription>Latest clinical notes</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEncounters.length > 0 ? (
                <div className="space-y-3">
                  {recentEncounters.slice(0, 3).map((encounter: Encounter) => (
                    <div
                      key={encounter.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {encounter.title || "Untitled Encounter"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {encounter.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded">
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
            </ol>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Welcome to AaroNotes!
          </h3>{" "}
          <p className="text-blue-700">
            You&apos;ve successfully signed up. Complete the database setup to
            start managing patients and clinical notes.
          </p>
        </div>
      </div>
    );
  }
}
