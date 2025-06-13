import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AaroNotes - Clinical Documentation",
  description: "AI-powered clinical documentation from speech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (
    !publishableKey ||
    publishableKey.includes("placeholder") ||
    publishableKey.includes("your_clerk")
  ) {
    // For development/build without real Clerk keys
    return (
      <html lang="en">
        <head>
          <link
            href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700,800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className={`${inter.variable} antialiased font-satoshi`}>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                AaroNotes
              </h1>
              <p className="text-gray-600 mb-4">
                Please configure your Clerk API keys to use the application.
              </p>
              <p className="text-sm text-gray-500">
                Add your keys to .env.local and restart the development server.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link
            href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700,800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className={`${inter.variable} antialiased font-satoshi`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
