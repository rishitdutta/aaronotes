"use client";

/**
 * ClickableTranscript Component
 *
 * Provides an interactive transcript where users can click on any text segment
 * to hear the corresponding audio portion. Features include:
 *
 * - Click-to-play functionality for each transcript chunk
 * - Visual feedback for currently playing segments
 * - Global audio control panel
 * - Automatic audio timing and synchronization
 * - Support for multiple audio files with corresponding transcripts
 *
 * @param transcripts - Array of transcript data with timing information
 * @param audioFiles - Array of audio file objects corresponding to transcripts
 * @param className - Optional CSS classes for styling
 */

import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeUp,
  faStop,
} from "@fortawesome/free-solid-svg-icons";

interface TranscriptChunk {
  start: number;
  end: number;
  text: string;
}

interface AudioFile {
  id: string;
  blob: Blob;
  url: string;
  name: string;
  type: "recorded" | "uploaded";
  duration: number;
}

interface ClickableTranscriptProps {
  transcripts: Array<{
    filename: string;
    transcript: string;
    chunks: TranscriptChunk[];
    language: string;
    language_probability: number;
  }>;
  audioFiles: AudioFile[];
  className?: string;
}

export default function ClickableTranscript({
  transcripts,
  audioFiles,
  className = "",
}: ClickableTranscriptProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<{
    audioId: string;
    chunkIndex: number;
  } | null>(null);

  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Initialize audio elements for each audio file
  const getAudioElement = (audioFile: AudioFile): HTMLAudioElement => {
    if (!audioRefs.current.has(audioFile.id)) {
      const audio = new Audio(audioFile.url);
      audio.preload = "metadata";
      audioRefs.current.set(audioFile.id, audio);
    }
    return audioRefs.current.get(audioFile.id)!;
  };

  const playAudioSegment = async (
    audioFile: AudioFile,
    chunk: TranscriptChunk,
    chunkIndex: number
  ) => {
    try {
      // Stop any currently playing audio
      if (currentlyPlaying) {
        const currentAudio = audioRefs.current.get(currentlyPlaying.audioId);
        if (currentAudio) {
          currentAudio.pause();
        }
      }

      const audio = getAudioElement(audioFile);

      // Set the start time
      audio.currentTime = chunk.start;

      // Create a promise to handle the audio playback
      const playPromise = new Promise<void>((resolve, reject) => {
        const onTimeUpdate = () => {
          if (audio.currentTime >= chunk.end) {
            audio.pause();
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("error", onError);
            setCurrentlyPlaying(null);
            resolve();
          }
        };

        const onEnded = () => {
          audio.removeEventListener("timeupdate", onTimeUpdate);
          audio.removeEventListener("ended", onEnded);
          audio.removeEventListener("error", onError);
          setCurrentlyPlaying(null);
          resolve();
        };

        const onError = () => {
          audio.removeEventListener("timeupdate", onTimeUpdate);
          audio.removeEventListener("ended", onEnded);
          audio.removeEventListener("error", onError);
          setCurrentlyPlaying(null);
          reject(new Error("Audio playback failed"));
        };

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);

        // Set currently playing state
        setCurrentlyPlaying({
          audioId: audioFile.id,
          chunkIndex,
        });

        // Start playback
        audio.play().catch(reject);
      });

      await playPromise;
    } catch (error) {
      console.error("Error playing audio segment:", error);
      setCurrentlyPlaying(null);
    }
  };

  const stopCurrentPlayback = () => {
    if (currentlyPlaying) {
      const audio = audioRefs.current.get(currentlyPlaying.audioId);
      if (audio) {
        audio.pause();
      }
      setCurrentlyPlaying(null);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!transcripts || transcripts.length === 0) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-600">
          No transcript data available for audio playback.
        </p>
      </div>
    );
  }
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Global Audio Control Panel */}
      {currentlyPlaying && (
        <div className="sticky top-4 z-10 bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faPlay}
              className="w-4 h-4 mr-2 animate-pulse"
            />
            <span className="text-sm font-medium">
              Playing:{" "}
              {transcripts.find(
                (_, idx) => audioFiles[idx]?.id === currentlyPlaying.audioId
              )?.filename || "Audio"}
            </span>
          </div>
          <button
            onClick={stopCurrentPlayback}
            className="flex items-center px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
          >
            <FontAwesomeIcon icon={faStop} className="w-3 h-3 mr-1" />
            Stop
          </button>
        </div>
      )}

      {transcripts.map((transcript, transcriptIndex) => {
        const correspondingAudioFile = audioFiles[transcriptIndex];

        if (!correspondingAudioFile) {
          return (
            <div
              key={transcriptIndex}
              className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <p className="text-yellow-800 text-sm mb-2">
                <FontAwesomeIcon icon={faVolumeUp} className="w-4 h-4 mr-2" />
                Audio file not available for: {transcript.filename}
              </p>
              <p className="text-gray-700">{transcript.transcript}</p>
            </div>
          );
        }

        return (
          <div
            key={transcriptIndex}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <FontAwesomeIcon
                  icon={faVolumeUp}
                  className="w-4 h-4 mr-2 text-blue-600"
                />
                {transcript.filename}
              </h4>
              <div className="text-xs text-gray-500">
                {transcript.language} (
                {Math.round(transcript.language_probability * 100)}% confidence)
              </div>
            </div>

            <div className="space-y-1">
              {transcript.chunks.map((chunk, chunkIndex) => {
                const isCurrentlyPlaying =
                  currentlyPlaying?.audioId === correspondingAudioFile.id &&
                  currentlyPlaying?.chunkIndex === chunkIndex;

                return (
                  <span
                    key={chunkIndex}
                    className={`
                      inline-block px-2 py-1 rounded-md cursor-pointer transition-all duration-200 mr-1 mb-1
                      ${
                        isCurrentlyPlaying
                          ? "bg-blue-500 text-white shadow-md transform scale-105"
                          : "hover:bg-blue-100 hover:text-blue-800 hover:shadow-sm border border-transparent hover:border-blue-200"
                      }
                      text-sm leading-relaxed
                    `}
                    onClick={() => {
                      if (isCurrentlyPlaying) {
                        stopCurrentPlayback();
                      } else {
                        playAudioSegment(
                          correspondingAudioFile,
                          chunk,
                          chunkIndex
                        );
                      }
                    }}
                    title={`Click to ${
                      isCurrentlyPlaying ? "stop" : "play"
                    }: ${formatTime(chunk.start)} - ${formatTime(chunk.end)}`}
                  >
                    {chunk.text}
                    {isCurrentlyPlaying && (
                      <FontAwesomeIcon
                        icon={faPause}
                        className="w-3 h-3 ml-1 text-white animate-pulse"
                      />
                    )}
                  </span>
                );
              })}
            </div>

            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
              💡 Click on any word or phrase to hear that specific part of the
              recording
            </div>
          </div>
        );
      })}
    </div>
  );
}
