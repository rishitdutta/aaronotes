"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DatabaseStatus {
  status: string;
  counts: {
    users: number;
    patients: number;
    encounters: number;
  };
  currentUser: {
    id: string;
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  userPatients: Array<{
    id: string;
    name: string;
    encounterCount: number;
    createdAt: string;
  }>;
}

export default function TestDatabasePage() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testDatabase = async () => {
      try {
        const response = await fetch("/api/test-db");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to test database");
        }
        const data = await response.json();
        setDbStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    testDatabase();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Database Test</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Database Test</h1>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">
              Database Connection Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Database Test</h1>

      {dbStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 font-medium">{dbStatus.status}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Counts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>Total Users: {dbStatus.counts.users}</div>
                <div>Total Patients: {dbStatus.counts.patients}</div>
                <div>Total Encounters: {dbStatus.counts.encounters}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  Name: {dbStatus.currentUser.firstName}{" "}
                  {dbStatus.currentUser.lastName}
                </div>
                <div>Email: {dbStatus.currentUser.email}</div>
                <div>Clerk ID: {dbStatus.currentUser.clerkId}</div>
                <div>Database ID: {dbStatus.currentUser.id}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Patients</CardTitle>
            </CardHeader>
            <CardContent>
              {dbStatus.userPatients.length > 0 ? (
                <div className="space-y-3">
                  {dbStatus.userPatients.map((patient) => (
                    <div key={patient.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-gray-600">
                        {patient.encounterCount} encounters • Created:{" "}
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No patients found</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
