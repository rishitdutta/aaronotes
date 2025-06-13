"use client";

import { useState, useRef } from "react";
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
  const [encounterTitle, setEncounterTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const recordingId = Date.now().toString();

      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
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

    try {
      // Here you would send the audio files to your transcription service
      const formData = new FormData();
      audioFiles.forEach((audioFile, index) => {
        formData.append(`audio_${index}`, audioFile.blob);
      });
      formData.append("patientName", patientName);
      formData.append("title", encounterTitle);

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      alert("Encounter processed successfully! (This is a demo)");

      // Reset form
      setAudioFiles([]);
      setPatientName("");
      setEncounterTitle("");
      setRecordingTime(0);
    } catch (error) {
      console.error("Error processing encounter:", error);
      alert("Error processing encounter. Please try again.");
    } finally {
      setIsProcessing(false);
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
            <div>
              <Label htmlFor="patient-name" className="mb-2 block">
                Patient Name (Optional)
              </Label>
              <Input
                id="patient-name"
                placeholder="Enter patient name or leave blank to infer from recording"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
              <p className="text-xs text-gray-600 mt-1">
                If left blank, we&apos;ll try to identify the patient from the
                recording
              </p>
            </div>
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
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary mr-3"></div>
                    Processing...
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
