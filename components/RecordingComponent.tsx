"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Save, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface StructuredNote {
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExam?: string;
  assessment?: string;
  plan?: string;
}

interface RecordingComponentProps {
  patientId: string;
  onEncounterSaved?: (encounterId: string) => void;
}

export default function RecordingComponent({
  patientId,
  onEncounterSaved,
}: RecordingComponentProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [structuredNote, setStructuredNote] = useState<StructuredNote | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        await processAudio(audioBlob);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsProcessing(true);

      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio_file", audioBlob, "recording.wav");
      formData.append("patient_id", patientId);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio");
      }

      const result = await response.json();
      setTranscript(result.transcript);
      setStructuredNote(result.structuredNote);
    } catch (error) {
      console.error("Error processing audio:", error);
      alert("Failed to process the recording. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveEncounter = async () => {
    try {
      const response = await fetch("/api/encounters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          transcript,
          structuredNote,
          duration: recordingTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save encounter");
      }

      const result = await response.json();
      onEncounterSaved?.(result.id);

      // Reset the component
      setTranscript("");
      setStructuredNote(null);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error saving encounter:", error);
      alert("Failed to save the encounter. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Recording</CardTitle>
          <CardDescription>
            Record your clinical notes and let AI structure them for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            {!isRecording && !isProcessing && !transcript && (
              <Button
                onClick={startRecording}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <div className="text-center space-y-4">
                <Button onClick={stopRecording} variant="destructive" size="lg">
                  <Square className="h-5 w-5 mr-2" />
                  Stop Recording
                </Button>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-mono">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-gray-600">Processing your recording...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcript */}
      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Transcript</CardTitle>
            <CardDescription>
              The speech-to-text conversion of your recording
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={6}
              className="w-full"
              placeholder="Your transcript will appear here..."
            />
          </CardContent>
        </Card>
      )}

      {/* Structured Note */}
      {structuredNote && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Structured Clinical Note</CardTitle>
                <CardDescription>
                  AI-generated structured documentation
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Preview" : "Edit"}
                </Button>
                <Button onClick={saveEncounter}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Encounter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={JSON.stringify(structuredNote, null, 2)}
                onChange={(e) => {
                  try {
                    setStructuredNote(JSON.parse(e.target.value));
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                rows={15}
                className="w-full font-mono text-sm"
              />
            ) : (
              <div className="space-y-4">
                {structuredNote.chiefComplaint && (
                  <div>
                    <Badge className="mb-2">Chief Complaint</Badge>
                    <p className="text-gray-900">
                      {structuredNote.chiefComplaint}
                    </p>
                  </div>
                )}

                {structuredNote.historyOfPresentIllness && (
                  <div>
                    <Badge className="mb-2">History of Present Illness</Badge>
                    <p className="text-gray-900">
                      {structuredNote.historyOfPresentIllness}
                    </p>
                  </div>
                )}

                {structuredNote.physicalExam && (
                  <div>
                    <Badge className="mb-2">Physical Examination</Badge>
                    <p className="text-gray-900">
                      {structuredNote.physicalExam}
                    </p>
                  </div>
                )}

                {structuredNote.assessment && (
                  <div>
                    <Badge className="mb-2">Assessment</Badge>
                    <p className="text-gray-900">{structuredNote.assessment}</p>
                  </div>
                )}

                {structuredNote.plan && (
                  <div>
                    <Badge className="mb-2">Plan</Badge>
                    <p className="text-gray-900">{structuredNote.plan}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
