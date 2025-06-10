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
    const audioFile = formData.get("audio_file") as File;
    const patientId = formData.get("patient_id") as string;

    if (!audioFile || !patientId) {
      return NextResponse.json(
        { error: "Missing audio file or patient ID" },
        { status: 400 }
      );
    }

    // Step 1: Send audio to your backend for transcription
    const backendFormData = new FormData();
    backendFormData.append("audio_file", audioFile);

    const transcriptionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/transcribe`,
      {
        method: "POST",
        body: backendFormData,
      }
    );

    if (!transcriptionResponse.ok) {
      throw new Error("Failed to transcribe audio");
    }

    const transcriptionResult = await transcriptionResponse.json();
    const transcript = transcriptionResult.text;

    // Step 2: Send transcript to OpenAI for structuring
    const structuredNote = await structureTranscript(transcript);

    // Step 3: Save to database
    const encounter = await db.encounter.create({
      data: {
        patientId,
        rawTranscript: transcript,
        structuredNote,
        status: "DRAFT",
      },
    });

    return NextResponse.json({
      transcript,
      structuredNote,
      encounterId: encounter.id,
    });
  } catch (error) {
    console.error("Error processing transcription:", error);
    return NextResponse.json(
      { error: "Failed to process audio" },
      { status: 500 }
    );
  }
}

async function structureTranscript(transcript: string) {
  const prompt = `
You are a medical AI assistant. Please structure the following clinical transcript into a well-organized clinical note with the following sections. Return your response as a JSON object with these fields:

- chiefComplaint: The main reason for the visit
- historyOfPresentIllness: Detailed description of the current condition
- physicalExam: Physical examination findings
- assessment: Clinical assessment and diagnosis
- plan: Treatment plan and follow-up

Here is the transcript:
${transcript}

Please respond with only a valid JSON object.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a medical AI assistant that structures clinical notes. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const result = await response.json();
    const structuredText = result.choices[0].message.content; // Parse the JSON response
    try {
      return JSON.parse(structuredText);
    } catch {
      console.error("Failed to parse OpenAI response as JSON:", structuredText);
      // Return a fallback structure
      return {
        chiefComplaint: "Unable to extract chief complaint",
        historyOfPresentIllness: transcript,
        physicalExam: "Physical exam details not clearly identified",
        assessment: "Assessment requires manual review",
        plan: "Plan requires manual review",
      };
    }
  } catch (error) {
    console.error("Error structuring transcript:", error);
    // Return a fallback structure
    return {
      chiefComplaint: "Error processing transcript",
      historyOfPresentIllness: transcript,
      physicalExam: "Physical exam details not available",
      assessment: "Assessment requires manual review",
      plan: "Plan requires manual review",
    };
  }
}
