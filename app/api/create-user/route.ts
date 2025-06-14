import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user already exists
    let dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (dbUser) {
      return NextResponse.json({
        message: "User already exists",
        user: dbUser,
      });
    }

    // Create the user
    dbUser = await db.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        image: user.imageUrl,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: dbUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
