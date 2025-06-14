"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import SelectableTranscript from "@/components/SelectableTranscript";
import PatientSelector from "@/components/PatientSelector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faPlay,
  faPause,
  faStop,
  faUpload,
  faFileAudio,
  faUser,
  faClock,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

export default function EncounterPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFiles, setAudioFiles] = useState<
    Array<{
      id: string;
      blob: Blob;
      url: string;
      name: string;
      type: "recorded" | "uploaded";
      duration: number;
    }>
  >([]);
  const [patientName, setPatientName] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [encounterTitle, setEncounterTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [lastResult, setLastResult] = useState<{
    transcript: string;
    structuredNote: Record<string, string>;
    encounterId?: string;
    patientId?: string;
    patientName?: string;
    encounterTitle?: string;
    createdPatient?: boolean;
    transcripts?: Array<{
      filename: string;
      transcript: string;
      chunks: Array<{
        start: number;
        end: number;
        text: string;
      }>;
      language: string;
      language_probability: number;
    }>;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try to use WAV format if supported, otherwise use webm
      let mimeType = "audio/wav";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm;codecs=opus";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/webm";
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const recordingId = Date.now().toString();

      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const newAudioFile = {
          id: recordingId,
          blob,
          url,
          name: `Recording ${audioFiles.length + 1}`,
          type: "recorded" as const,
          duration: recordingTime,
        };

        setAudioFiles((prev) => [...prev, newAudioFile]);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Error accessing microphone. Please ensure microphone permissions are granted."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Resume timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith("audio/")) {
          const fileId = (Date.now() + index).toString();
          const url = URL.createObjectURL(file);
          const newAudioFile = {
            id: fileId,
            blob: file,
            url,
            name: file.name,
            type: "uploaded" as const,
            duration: 0, // Will be updated when audio loads
          };

          setAudioFiles((prev) => [...prev, newAudioFile]);
        } else {
          alert(`${file.name} is not a valid audio file.`);
        }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const processEncounter = async () => {
    if (audioFiles.length === 0) {
      alert("No audio files found.");
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Preparing audio files...");
    setLastResult(null);

    try {
      // Send audio files to transcription service
      const formData = new FormData();

      // Add all audio files with proper file names
      audioFiles.forEach((audioFile, index) => {
        // Convert blob to file with proper name and type
        const file = new File(
          [audioFile.blob],
          audioFile.name || `recording_${index + 1}`,
          {
            type: audioFile.blob.type || "audio/webm",
          }
        );
        formData.append("audio_files", file);
      });

      // Add metadata
      if (patientName) formData.append("patientName", patientName);
      if (selectedPatientId) formData.append("patientId", selectedPatientId);
      if (encounterTitle) formData.append("encounterTitle", encounterTitle);

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      setProcessingStatus("Transcribing audio files...");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process encounter");
      }

      setProcessingStatus("Processing transcription results...");
      const result = await response.json();
      setLastResult(result);

      // Show success message with more details
      const transcriptPreview =
        result.transcript?.substring(0, 200) || "No transcript available";

      let successMessage = `Encounter processed successfully!`;

      if (result.createdPatient) {
        successMessage += `\n\n✓ New patient created: ${result.patientName}`;
      } else if (result.patientName) {
        successMessage += `\n\n✓ Patient: ${result.patientName}`;
      }

      if (result.encounterId) {
        successMessage += `\n✓ Encounter saved to database (ID: ${result.encounterId})`;
      }

      successMessage += `\n\nTranscript Preview:\n"${transcriptPreview}${
        result.transcript?.length > 200 ? "..." : ""
      }"\n\nStructured Note: ${
        result.structuredNote ? "Generated" : "Not available"
      }`;

      alert(successMessage);

      // Reset form
      setAudioFiles([]);
      setPatientName("");
      setEncounterTitle("");
      setRecordingTime(0);
    } catch (error) {
      console.error("Error processing encounter:", error);
      alert(
        `Error processing encounter: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const saveEncounter = async () => {
    if (!lastResult || !lastResult.transcript) {
      alert("No processed encounter to save");
      return;
    }

    try {
      const encounterData = {
        patientId: lastResult.patientId || selectedPatientId,
        transcript: lastResult.transcript,
        structuredNote: lastResult.structuredNote,
        title: lastResult.encounterTitle || encounterTitle || "Clinical Note",
        duration: 0, // We can add audio duration calculation later
      };

      const response = await fetch("/api/encounters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(encounterData),
      });

      if (!response.ok) {
        throw new Error("Failed to save encounter");
      }

      const savedEncounter = await response.json();
      alert(`Encounter saved successfully! ID: ${savedEncounter.id}`);
      
      // Reset form after successful save
      setAudioFiles([]);
      setPatientName("");
      setSelectedPatientId("");
      setEncounterTitle("");
      setLastResult(null);
      
    } catch (error) {
      console.error("Error saving encounter:", error);
      alert("Failed to save encounter. Please try again.");
    }
  };

  const removeAudioFile = (fileId: string) => {
    setAudioFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary mb-3">
          New Encounter
        </h1>
        <p className="text-gray-600">
          Record or upload audio for clinical documentation
        </p>
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recording Section */}{" "}
        <Card className="card-hover shadow-brand">
          <CardHeader className="pb-6">
            <CardTitle className="text-brand-primary flex items-center text-lg">
              <FontAwesomeIcon
                icon={faMicrophone}
                className="w-5 h-5 mr-3 text-brand-icon"
              />
              Audio Recording
            </CardTitle>
            <CardDescription className="text-gray-600">
              Record live audio or upload an existing file
            </CardDescription>
          </CardHeader>{" "}
          <CardContent className="space-y-6">
            {/* Recording Controls */}
            <div className="flex flex-col items-center space-y-6">
              <div className="text-5xl font-mono text-brand-primary bg-gray-50 px-8 py-4 rounded-2xl">
                {formatTime(recordingTime)}
              </div>

              <div className="flex items-center space-x-4">
                {" "}
                {!isRecording && (
                  <button
                    onClick={startRecording}
                    className="btn-brand flex items-center px-8 py-4 rounded-2xl font-medium transition-all shadow-sm"
                  >
                    <FontAwesomeIcon
                      icon={faMicrophone}
                      className="w-5 h-5 mr-3 text-brand-icon"
                    />
                    {audioFiles.length > 0
                      ? "Record Another"
                      : "Start Recording"}
                  </button>
                )}
                {isRecording && !isPaused && (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="btn-brand flex items-center px-6 py-3 rounded-xl"
                    >
                      <FontAwesomeIcon
                        icon={faPause}
                        className="w-4 h-4 mr-2 text-brand-icon"
                      />
                      Pause
                    </button>
                    <button
                      onClick={stopRecording}
                      className="bg-red-500 hover:bg-red-600 text-white flex items-center px-6 py-3 rounded-xl transition-colors shadow-sm"
                    >
                      <FontAwesomeIcon icon={faStop} className="w-4 h-4 mr-2" />
                      Stop
                    </button>{" "}
                  </>
                )}
                {isPaused && (
                  <>
                    <button
                      onClick={resumeRecording}
                      className="btn-brand flex items-center px-6 py-3 rounded-xl"
                    >
                      <FontAwesomeIcon
                        icon={faPlay}
                        className="w-4 h-4 mr-2 text-brand-icon"
                      />
                      Resume
                    </button>
                    <button
                      onClick={stopRecording}
                      className="bg-red-500 hover:bg-red-600 text-white flex items-center px-6 py-3 rounded-xl transition-colors shadow-sm"
                    >
                      <FontAwesomeIcon icon={faStop} className="w-4 h-4 mr-2" />
                      Stop
                    </button>
                  </>
                )}
              </div>

              {/* Recording Status */}
              {isRecording && (
                <div className="flex items-center text-red-500 animate-pulse">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  {isPaused ? "Recording Paused" : "Recording..."}
                </div>
              )}
            </div>
            {/* File Upload */}
            <div className="border-t pt-6">
              <div className="text-center">
                {" "}
                <p className="text-gray-600 mb-4">
                  {audioFiles.length > 0
                    ? "Upload additional audio files"
                    : "Or upload an existing audio file"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload audio files"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-brand flex items-center px-6 py-3 rounded-xl mx-auto shadow-sm"
                >
                  <FontAwesomeIcon
                    icon={faUpload}
                    className="w-4 h-4 mr-3 text-brand-icon"
                  />
                  Upload Audio Files
                </button>
              </div>{" "}
            </div>{" "}
            {/* Audio Files List */}
            {audioFiles.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon
                    icon={faFileAudio}
                    className="w-5 h-5 text-brand-icon mr-2"
                  />
                  <span className="text-brand-primary font-medium">
                    Audio Files ({audioFiles.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {audioFiles.map((audioFile) => (
                    <div
                      key={audioFile.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center flex-1">
                        <FontAwesomeIcon
                          icon={faFileAudio}
                          className="w-4 h-4 text-brand-icon mr-3"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {audioFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {audioFile.type === "recorded"
                              ? "Recorded"
                              : "Uploaded"}{" "}
                            •
                            {audioFile.type === "recorded" &&
                              ` ${formatTime(audioFile.duration)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <audio controls className="h-8">
                          <source src={audioFile.url} type="audio/wav" />
                          Your browser does not support the audio element.
                        </audio>
                        <button
                          onClick={() => removeAudioFile(audioFile.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          aria-label="Remove audio file"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>{" "}
        </Card>
        {/* Encounter Details */}{" "}
        <Card className="card-hover shadow-brand">
          <CardHeader className="pb-6">
            <CardTitle className="text-brand-primary flex items-center text-lg">
              <FontAwesomeIcon
                icon={faUser}
                className="w-5 h-5 mr-3 text-brand-icon"
              />
              Encounter Details
            </CardTitle>
            <CardDescription className="text-gray-600">
              Add patient information and encounter details
            </CardDescription>
          </CardHeader>{" "}
          <CardContent className="space-y-6">
            <PatientSelector
              selectedPatientId={selectedPatientId}
              selectedPatientName={patientName}
              onPatientSelect={(patient) => {
                if (patient) {
                  setSelectedPatientId(patient.id);
                  setPatientName(patient.name);
                } else {
                  setSelectedPatientId("");
                }
              }}
              onNewPatientName={(name) => setPatientName(name)}
            />
            <div>
              <Label htmlFor="encounter-title" className="mb-2 block">
                Encounter Title (Optional)
              </Label>
              <Input
                id="encounter-title"
                placeholder="e.g., Follow-up visit, Initial consultation"
                value={encounterTitle}
                onChange={(e) => setEncounterTitle(e.target.value)}
              />
            </div>
            <div className="border-t pt-6">
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="w-4 h-4 mr-3 text-brand-icon"
                  />
                  Duration: {formatTime(recordingTime)}
                </div>{" "}
                <div className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon
                    icon={faFileAudio}
                    className="w-4 h-4 mr-3 text-brand-icon"
                  />
                  Audio Files:{" "}
                  {audioFiles.length > 0
                    ? `${audioFiles.length} file(s) ready`
                    : "No files uploaded"}
                </div>
              </div>
            </div>
            <div className="border-t pt-6">
              {" "}
              <button
                onClick={processEncounter}
                disabled={audioFiles.length === 0 || isProcessing}
                className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-medium transition-all shadow-sm ${
                  audioFiles.length > 0 && !isProcessing
                    ? "btn-brand"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {" "}
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary mr-3"></div>
                    {processingStatus || "Processing..."}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon
                      icon={faSave}
                      className="w-4 h-4 mr-3 text-brand-icon"
                    />
                    Process Encounter
                  </>
                )}
              </button>
            </div>
          </CardContent>{" "}
        </Card>
      </div>
      {/* Results Section */}
      {lastResult && (
        <Card className="card-hover shadow-brand mt-8">
          <CardHeader>
            <CardTitle className="text-brand-primary flex items-center text-lg">
              <FontAwesomeIcon
                icon={faSave}
                className="w-5 h-5 mr-3 text-brand-icon"
              />
              Last Processing Results
            </CardTitle>
            <CardDescription className="text-gray-600">
              Results from the most recent audio processing
            </CardDescription>
          </CardHeader>{" "}
          <CardContent className="space-y-6">
            {/* Raw Transcript with Selection */}
            {lastResult.transcript && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Raw Transcript</h3>{" "}
                <SelectableTranscript
                  transcript={lastResult.transcript}
                  transcripts={lastResult.transcripts}
                  audioFiles={audioFiles}
                  className="mb-2"
                />
                <p className="text-xs text-gray-500 italic">
                  💡 Select any text above to see &quot;Hear original&quot; option
                </p>
              </div>
            )}{" "}
            {lastResult.structuredNote && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Structured Clinical Note
                </h3>
                <div className="space-y-3">
                  {Object.entries(lastResult.structuredNote).map(
                    ([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-sm text-gray-800 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {value as string}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}{" "}
            {lastResult.encounterId && (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                <div>
                  <div className="text-sm font-medium text-green-800">
                    ✓ Encounter saved to database
                  </div>
                  <div className="text-xs text-green-600">
                    ID: {lastResult.encounterId}
                    {lastResult.patientId &&
                      ` • Patient ID: ${lastResult.patientId}`}
                  </div>
                </div>
                {lastResult.patientId && (
                  <Link
                    href={`/dashboard/patients/${lastResult.patientId}`}
                    className="text-sm text-green-700 hover:text-green-800 underline"
                  >
                    View Patient →
                  </Link>
                )}
              </div>            )}
            {lastResult.createdPatient && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-sm font-medium text-blue-800">
                  ✓ New patient created: {lastResult.patientName}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  The patient name was extracted from your recording and a new
                  patient record was created.
                </div>
              </div>
            )}
            
            {/* Save Encounter Button */}
            {lastResult && lastResult.transcript && (
              <div className="border-t pt-6">
                <button
                  onClick={saveEncounter}
                  className="w-full btn-brand flex items-center justify-center px-6 py-4 rounded-xl font-medium shadow-sm"
                >
                  <FontAwesomeIcon icon={faSave} className="w-5 h-5 mr-3" />
                  Save Encounter to Patient Record
                </button>
              </div>
            )}
            <div className="border-t pt-6">
              <button
                onClick={saveEncounter}
                className="w-full flex items-center justify-center px-6 py-4 rounded-xl font-medium transition-all shadow-sm btn-brand"
              >
                <FontAwesomeIcon
                  icon={faSave}
                  className="w-4 h-4 mr-3 text-brand-icon"
                />
                Save Encounter
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
