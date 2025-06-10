import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, transcript, structuredNote, duration, title } = body;

    if (!patientId || !transcript) {
      return NextResponse.json(
        { error: "Patient ID and transcript are required" },
        { status: 400 }
      );
    }

    // Verify the patient belongs to the current user
    const patient = await db.patient.findFirst({
      where: {
        id: patientId,
        user: {
          clerkId: user.id,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const encounter = await db.encounter.create({
      data: {
        patientId,
        rawTranscript: transcript,
        structuredNote,
        duration,
        title: title || "Clinical Note",
        status: "FINAL",
      },
    });

    return NextResponse.json(encounter);
  } catch (error) {
    console.error("Error creating encounter:", error);
    return NextResponse.json(
      { error: "Failed to create encounter" },
      { status: 500 }
    );
  }
}
