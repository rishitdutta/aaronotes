"use client";

import { ArrowLeft, Clock, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

// Mock data - would come from your API
const mockEncounter = {
  id: "1",
  title: "Annual Physical Exam",
  createdAt: new Date("2025-06-01"),
  status: "FINAL",
  duration: 1800,
  rawTranscript:
    "Patient presents for annual physical examination. No acute complaints. Review of systems negative except for occasional headaches. Physical examination reveals normal vital signs, heart rate regular, lungs clear, abdomen soft and non-tender.",
  structuredNote: {
    chiefComplaint: "Annual physical examination",
    historyOfPresentIllness:
      "Patient presents for routine annual physical examination. No acute complaints at this time. Review of systems notable for occasional headaches, otherwise negative.",
    physicalExam:
      "Vital signs: BP 120/80, HR 72, RR 16, Temp 98.6°F. General appearance: Well-appearing, no acute distress. Heart: Regular rate and rhythm, no murmurs. Lungs: Clear to auscultation bilaterally. Abdomen: Soft, non-tender, no masses.",
    assessment:
      "Healthy adult for annual examination. Occasional headaches likely tension-type.",
    plan: "Continue current health maintenance. Recommend stress management techniques for headaches. Return in 1 year for next annual exam or sooner if concerns arise.",
  },
};

const mockPatient = {
  id: "1",
  name: "John Doe",
};

export default function EncounterDetailPage() {
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(mockEncounter.structuredNote);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minutes`;
  };

  const handleSave = () => {
    // Save the edited note
    console.log("Saving edited note:", editedNote);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/patients/${params.patientId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patient
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mockEncounter.title}
            </h1>
            <p className="text-gray-600">
              {mockPatient.name} •{" "}
              {mockEncounter.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge
            variant={mockEncounter.status === "FINAL" ? "default" : "secondary"}
          >
            {mockEncounter.status}
          </Badge>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          {isEditing && (
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Encounter Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Encounter Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-500">Date & Time</label>
              <p className="text-gray-900">
                {mockEncounter.createdAt.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-500">Duration</label>
              <div className="flex items-center text-gray-900">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(mockEncounter.duration)}
              </div>
            </div>
            <div>
              <label className="font-medium text-gray-500">Status</label>
              <p className="text-gray-900">{mockEncounter.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Raw Transcript */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Transcript</CardTitle>
            <CardDescription>
              Original speech-to-text conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">
                {mockEncounter.rawTranscript}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Structured Note */}
        <Card>
          <CardHeader>
            <CardTitle>Structured Clinical Note</CardTitle>
            <CardDescription>
              AI-organized clinical documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chief Complaint
                  </label>
                  <Textarea
                    value={editedNote.chiefComplaint}
                    onChange={(e) =>
                      setEditedNote({
                        ...editedNote,
                        chiefComplaint: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    History of Present Illness
                  </label>
                  <Textarea
                    value={editedNote.historyOfPresentIllness}
                    onChange={(e) =>
                      setEditedNote({
                        ...editedNote,
                        historyOfPresentIllness: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Physical Examination
                  </label>
                  <Textarea
                    value={editedNote.physicalExam}
                    onChange={(e) =>
                      setEditedNote({
                        ...editedNote,
                        physicalExam: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Assessment
                  </label>
                  <Textarea
                    value={editedNote.assessment}
                    onChange={(e) =>
                      setEditedNote({
                        ...editedNote,
                        assessment: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Plan</label>
                  <Textarea
                    value={editedNote.plan}
                    onChange={(e) =>
                      setEditedNote({ ...editedNote, plan: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {editedNote.chiefComplaint && (
                  <div>
                    <Badge className="mb-2">Chief Complaint</Badge>
                    <p className="text-gray-900">{editedNote.chiefComplaint}</p>
                  </div>
                )}

                {editedNote.historyOfPresentIllness && (
                  <div>
                    <Badge className="mb-2">History of Present Illness</Badge>
                    <p className="text-gray-900">
                      {editedNote.historyOfPresentIllness}
                    </p>
                  </div>
                )}

                {editedNote.physicalExam && (
                  <div>
                    <Badge className="mb-2">Physical Examination</Badge>
                    <p className="text-gray-900">{editedNote.physicalExam}</p>
                  </div>
                )}

                {editedNote.assessment && (
                  <div>
                    <Badge className="mb-2">Assessment</Badge>
                    <p className="text-gray-900">{editedNote.assessment}</p>
                  </div>
                )}

                {editedNote.plan && (
                  <div>
                    <Badge className="mb-2">Plan</Badge>
                    <p className="text-gray-900">{editedNote.plan}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
