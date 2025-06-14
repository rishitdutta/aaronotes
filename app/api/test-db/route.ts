import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Test database connection
    const userCount = await db.user.count();
    const patientCount = await db.patient.count();
    const encounterCount = await db.encounter.count();

    // Try to get or create user
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

    const userPatients = await db.patient.findMany({
      where: { userId: dbUser.id },
      include: {
        encounters: true,
      },
    });

    return NextResponse.json({
      status: "Database connection successful",
      counts: {
        users: userCount,
        patients: patientCount,
        encounters: encounterCount,
      },
      currentUser: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
      },
      userPatients: userPatients.map((p) => ({
        id: p.id,
        name: p.name,
        encounterCount: p.encounters.length,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
