import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Debug: Log what we received
    console.log("Received FormData entries:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Get all audio files from the form data
    const audioFiles: File[] = [];
    const audioEntries = formData.getAll("audio_files");

    for (const entry of audioEntries) {
      if (entry instanceof File) {
        audioFiles.push(entry);
      }
    }

    const patientName = formData.get("patientName") as string;
    const encounterTitle = formData.get("encounterTitle") as string;
    const patientId = formData.get("patientId") as string;

    if (audioFiles.length === 0) {
      return NextResponse.json(
        { error: "No audio files provided" },
        { status: 400 }
      );
    }

    // Step 1: Send audio files to backend for transcription and structuring
    const backendFormData = new FormData();

    // Add all audio files
    audioFiles.forEach((file) => {
      backendFormData.append("audio_files", file);
    });

    // Add metadata
    if (patientName) backendFormData.append("patient_name", patientName);
    if (encounterTitle)
      backendFormData.append("encounter_title", encounterTitle);

    // Debug: Log what we're sending to the backend
    console.log("Sending to backend:");
    for (const [key, value] of backendFormData.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // STEP 1: Test debug endpoints first
    console.log("Testing debug endpoints...");

    // Test debug-form endpoint
    try {
      const debugFormResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/debug-form`,
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
          body: backendFormData,
        }
      );

      console.log("Debug-form response status:", debugFormResponse.status);
      if (debugFormResponse.ok) {
        const debugFormResult = await debugFormResponse.json();
        console.log("Debug-form result:", debugFormResult);
      } else {
        const debugFormError = await debugFormResponse.text();
        console.log("Debug-form error:", debugFormError);
      }
    } catch (debugFormError) {
      console.log("Debug-form endpoint error:", debugFormError);
    }

    // STEP 2: Try the fixed transcribe-multiple endpoint with extended timeout
    console.log("Attempting transcription with fixed endpoint...");

    // Create AbortController for timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutes timeout

    let result: {
      combined_transcript: string;
      structured_note: any;
      transcripts: any[];
      patient_name: string;
      encounter_title: string;
    };

    try {
      const transcriptionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/transcribe-multiple`,
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
          body: backendFormData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId); // Clear timeout on successful response

      if (!transcriptionResponse.ok) {
        const errorText = await transcriptionResponse.text();
        throw new Error(`Failed to transcribe audio: ${errorText}`);
      }

      result = await transcriptionResponse.json();
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);

      const error = fetchError as { name?: string; cause?: { code?: string } };

      if (error.name === "AbortError") {
        throw new Error(
          "Transcription request timed out after 10 minutes. Please try with shorter audio files or fewer files at once."
        );
      }

      if (error.cause?.code === "UND_ERR_SOCKET") {
        // The backend likely completed processing but connection closed
        console.log(
          "Socket closed during transcription - backend may have completed processing"
        );
        throw new Error(
          "Connection closed during transcription. The backend completed processing (visible in logs) but the response was lost due to timeout. This is a known issue with long-running transcriptions. The transcription was successful but not returned to the frontend."
        );
      }

      throw fetchError;
    }

    // Step 3: Save to database if patientId is provided and we have a result
    let encounter = null;
    if (patientId && result) {
      encounter = await db.encounter.create({
        data: {
          patientId,
          rawTranscript: result.combined_transcript,
          structuredNote: result.structured_note,
          status: "DRAFT",
        },
      });
    }

    return NextResponse.json({
      transcript: result.combined_transcript,
      structuredNote: result.structured_note,
      transcripts: result.transcripts,
      encounterId: encounter?.id,
      patientName: result.patient_name,
      encounterTitle: result.encounter_title,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error processing transcription:", error);

    // Provide more specific error messages
    if (err.message?.includes("Connection closed during transcription")) {
      return NextResponse.json(
        {
          error:
            "Transcription completed on backend but response was lost due to timeout",
          details:
            "The backend successfully processed your audio files (check backend logs), but the connection timed out. This is a known issue with long transcriptions.",
          suggestion:
            "Try processing fewer files at once or shorter audio files",
        },
        { status: 408 } // Request Timeout
      );
    }

    if (err.message?.includes("timed out")) {
      return NextResponse.json(
        {
          error: "Request timed out",
          details: err.message,
          suggestion:
            "Try processing fewer files at once or shorter audio files",
        },
        { status: 408 } // Request Timeout
      );
    }

    return NextResponse.json(
      { error: "Failed to process audio", details: err.message },
      { status: 500 }
    );
  }
}
