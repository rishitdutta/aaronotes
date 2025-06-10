"use client";

import { ArrowLeft, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import RecordingComponent from "@/components/RecordingComponent";

// Mock data - would come from your API
const mockPatient = {
  id: "1",
  name: "John Doe",
  dateOfBirth: new Date("1980-05-15"),
  gender: "Male",
  contact: "john.doe@email.com",
  medicalId: "MRN-001234",
  encounters: [
    {
      id: "1",
      title: "Annual Physical Exam",
      createdAt: new Date("2025-06-01"),
      status: "FINAL",
      duration: 1800, // 30 minutes in seconds
    },
    {
      id: "2",
      title: "Follow-up Visit",
      createdAt: new Date("2025-05-15"),
      status: "DRAFT",
      duration: 900, // 15 minutes in seconds
    },
  ],
};

export default function PatientDetailPage() {
  const params = useParams();

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/patients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mockPatient.name}
            </h1>
            <p className="text-gray-600">
              Age {calculateAge(mockPatient.dateOfBirth)} • {mockPatient.gender}{" "}
              • MRN: {mockPatient.medicalId}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date of Birth
                </label>
                <p className="text-gray-900">
                  {mockPatient.dateOfBirth.toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Contact
                </label>
                <p className="text-gray-900">{mockPatient.contact}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Medical Record Number
                </label>
                <p className="text-gray-900">{mockPatient.medicalId}</p>
              </div>
            </CardContent>
          </Card>{" "}
          {/* New Encounter Card */}{" "}
          <RecordingComponent
            patientId={params.patientId as string}
            onEncounterSaved={() => {
              // Refresh the page or update the encounters list
              window.location.reload();
            }}
          />
        </div>

        {/* Encounters List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Encounter History</CardTitle>
                  <CardDescription>
                    Past clinical notes and documentation
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {mockPatient.encounters.length} encounters
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {mockPatient.encounters.length > 0 ? (
                <div className="space-y-4">
                  {mockPatient.encounters.map((encounter) => (
                    <Link
                      key={encounter.id}
                      href={`/dashboard/patients/${params.patientId}/encounters/${encounter.id}`}
                    >
                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {encounter.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span>
                                  {encounter.createdAt.toLocaleDateString()}
                                </span>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatDuration(encounter.duration)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              encounter.status === "FINAL"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {encounter.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No encounters yet
                  </h3>
                  <p className="text-gray-600">
                    Start recording to create the first clinical note for this
                    patient
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
