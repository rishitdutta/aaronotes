"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function TestBackendPage() {
  const [testResult, setTestResult] = useState<{
    status: "idle" | "testing" | "success" | "error";
    message: string;
    details?: Record<string, unknown>;
  }>({ status: "idle", message: "" });
  const testBackendConnection = async () => {
    setTestResult({
      status: "testing",
      message: "Testing backend connection...",
    });

    try {
      const response = await fetch("/api/test-backend");
      const data = await response.json();

      if (response.ok) {
        setTestResult({
          status: "success",
          message: "Backend connection successful!",
          details: data,
        });
      } else {
        setTestResult({
          status: "error",
          message: `Backend test failed: ${data.error}`,
          details: data,
        });
      }
    } catch (error) {
      setTestResult({
        status: "error",
        message: `Connection error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  };
  const testDebugEndpoints = async () => {
    setTestResult({
      status: "testing",
      message: "Testing debug endpoints...",
    });

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    try {
      // Test 1: debug-raw endpoint
      const formData = new FormData();
      const testBlob = new Blob(["test audio data"], { type: "audio/webm" });
      const testFile = new File([testBlob], "test.webm", {
        type: "audio/webm",
      });

      formData.append("audio_files", testFile);
      formData.append("patient_name", "Test Patient");
      formData.append("encounter_title", "Test Encounter");

      const rawResponse = await fetch(`${backendUrl}/debug-raw`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "true" },
        body: formData,
      });

      const rawResult = await rawResponse.text();

      // Test 2: debug-form endpoint
      const formResponse = await fetch(`${backendUrl}/debug-form`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "true" },
        body: formData,
      });

      const formResult = await formResponse.text();

      setTestResult({
        status: "success",
        message: "Debug endpoints tested successfully!",
        details: {
          "debug-raw": {
            status: rawResponse.status,
            response: rawResult,
          },
          "debug-form": {
            status: formResponse.status,
            response: formResult,
          },
        },
      });
    } catch (error) {
      setTestResult({
        status: "error",
        message: `Debug endpoints error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  };

  const testDirectBackendConnection = async () => {
    setTestResult({
      status: "testing",
      message: "Testing direct backend connection...",
    });

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const healthUrl = `${backendUrl}/health`;

    console.log("Backend URL:", backendUrl);
    console.log("Health URL:", healthUrl);

    try {
      // Test direct connection to backend
      const response = await fetch(healthUrl, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          status: "success",
          message: "Direct backend connection successful!",
          details: {
            url: healthUrl,
            response: data,
            note: "Backend is accessible directly",
          },
        });
      } else {
        setTestResult({
          status: "error",
          message: `Direct connection failed: ${response.status} ${response.statusText}`,
          details: {
            url: healthUrl,
            status: response.status,
            statusText: response.statusText,
            note: "This might be a CORS or authentication issue",
          },
        });
      }
    } catch (error) {
      setTestResult({
        status: "error",
        message: `Direct connection error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        details: {
          url: healthUrl,
          error: error instanceof Error ? error.message : "Unknown error",
          note: "This is likely a Google Colab session authentication issue",
        },
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary mb-3">
          Backend Integration Test
        </h1>
        <p className="text-gray-600">
          Test the connection to the FastAPI backend running on Google Colab
        </p>
      </div>

      <Card className="shadow-brand">
        <CardHeader>
          <CardTitle className="text-brand-primary">Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>
              <strong>Backend URL:</strong>{" "}
              {process.env.NEXT_PUBLIC_BACKEND_URL}
            </p>
          </div>{" "}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={testBackendConnection}
              disabled={testResult.status === "testing"}
              className="btn-brand px-6 py-3 rounded-xl flex items-center"
            >
              {testResult.status === "testing" && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="w-4 h-4 mr-2 animate-spin"
                />
              )}
              Test Via API Route
            </button>

            <button
              onClick={testDirectBackendConnection}
              disabled={testResult.status === "testing"}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center transition-colors"
            >
              {testResult.status === "testing" && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="w-4 h-4 mr-2 animate-spin"
                />
              )}
              Test Direct Connection
            </button>

            <button
              onClick={testDebugEndpoints}
              disabled={testResult.status === "testing"}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl flex items-center transition-colors"
            >
              {testResult.status === "testing" && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="w-4 h-4 mr-2 animate-spin"
                />
              )}
              Test Debug Endpoints
            </button>
          </div>
          {testResult.status !== "idle" && (
            <div
              className={`p-4 rounded-xl border ${
                testResult.status === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : testResult.status === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <div className="flex items-center mb-2">
                {testResult.status === "success" && (
                  <FontAwesomeIcon icon={faCheck} className="w-5 h-5 mr-2" />
                )}
                {testResult.status === "error" && (
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5 mr-2" />
                )}
                {testResult.status === "testing" && (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="w-5 h-5 mr-2 animate-spin"
                  />
                )}
                <span className="font-medium">{testResult.message}</span>
              </div>

              {testResult.details && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Backend Details:</p>
                  <pre className="text-xs bg-white/50 p-3 rounded border overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
