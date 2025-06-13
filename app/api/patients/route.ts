import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } // Ensure user exists in database
    let dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          image: user.imageUrl,
        },
      });
    }

    const patients = await db.patient.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        encounters: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, dateOfBirth, gender, contact, medicalId } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    } // Ensure user exists in database
    let dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          image: user.imageUrl,
        },
      });
    }

    const patient = await db.patient.create({
      data: {
        name,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        contact,
        medicalId,
        userId: dbUser.id,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}
