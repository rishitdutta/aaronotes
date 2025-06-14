"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

interface SelectableTranscriptProps {
  transcript: string;
  transcripts?: unknown[];
  audioFiles?: unknown[];
  className?: string;
}

export default function SelectableTranscript({
  transcript,
  className = "",
}: SelectableTranscriptProps) {
  return (
    <div className="relative">
      <div 
        className={`select-text cursor-text p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors ${className}`}
      >
        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
          {transcript}
        </p>
      </div>
      
      <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded opacity-75">
        <FontAwesomeIcon icon={faPlay} className="w-3 h-3 mr-1" />
        Audio playback coming soon
      </div>
    </div>
  );
}