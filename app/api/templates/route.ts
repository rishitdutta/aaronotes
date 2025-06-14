import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Get user templates
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database
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

    // For now, return default templates since we don't have a templates table yet
    // TODO: Create templates table in database schema
    const defaultTemplates = [
      {
        id: "default",
        name: "Standard Clinical Note",
        fields: [
          {
            id: "chief_complaint",
            name: "Chief Complaint",
            description: "Primary reason for visit",
            required: true,
          },
          {
            id: "history_present_illness",
            name: "History of Present Illness",
            description: "Detailed description of current symptoms",
            required: true,
          },
          {
            id: "review_systems",
            name: "Review of Systems",
            description: "Systematic review of body systems",
            required: false,
          },
          {
            id: "physical_exam",
            name: "Physical Examination",
            description: "Clinical findings from examination",
            required: true,
          },
          {
            id: "assessment_plan",
            name: "Assessment & Plan",
            description: "Diagnosis and treatment plan",
            required: true,
          },
        ],
      },
    ];

    return NextResponse.json(defaultTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// Save/update template
export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const template = await request.json();

    // Validate template structure
    if (!template.id || !template.name || !Array.isArray(template.fields)) {
      return NextResponse.json(
        { error: "Invalid template structure" },
        { status: 400 }
      );
    }

    // TODO: Save to database when templates table is created
    // For now, we'll rely on localStorage on the frontend

    return NextResponse.json({
      success: true,
      message: "Template saved successfully",
      template,
    });
  } catch (error) {
    console.error("Error saving template:", error);
    return NextResponse.json(
      { error: "Failed to save template" },
      { status: 500 }
    );
  }
}
