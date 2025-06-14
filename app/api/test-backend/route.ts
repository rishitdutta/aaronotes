import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      );
    } // Test health endpoint
    const healthResponse = await fetch(`${backendUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!healthResponse.ok) {
      throw new Error(
        `Backend responded with status: ${healthResponse.status}`
      );
    }

    const healthData = await healthResponse.json();

    return NextResponse.json({
      success: true,
      backend_url: backendUrl,
      backend_status: healthData,
      message: "Backend connection successful",
    });
  } catch (error) {
    console.error("Backend test error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        backend_url: process.env.NEXT_PUBLIC_BACKEND_URL,
      },
      { status: 500 }
    );
  }
}
