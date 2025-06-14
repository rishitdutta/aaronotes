import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faFileText,
  faUsers,
  faArrowRight,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background to-purple-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="AaroNotes"
              width={160}
              height={36}
              className="h-9 w-auto"
            />
          </div>
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
            >
              Sign In
            </Button>
          </SignInButton>
        </div>
      </nav>

      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-brand-primary mb-6 leading-tight">
            Clinical Documentation
            <span className="block text-brand-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your voice into structured clinical notes with AI-powered
            transcription and intelligent formatting
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="btn-brand text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <FontAwesomeIcon icon={faMicrophone} className="w-5 h-5 mr-3" />
                Start Recording
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 ml-3" />
              </Button>
            </SignInButton>
            <Link
              href="https://github.com/rishitdutta/aaronotes"
              target="_blank"
              className="text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center"
            >
              <FontAwesomeIcon icon={faGithub} className="w-5 h-5 mr-2" />
              View on GitHub
            </Link>
          </div>

          {/* Features Preview */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faCheck}
                className="w-4 h-4 mr-2 text-green-500"
              />
              AI-Powered Transcription
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faCheck}
                className="w-4 h-4 mr-2 text-green-500"
              />
              Medical Format Structuring
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faCheck}
                className="w-4 h-4 mr-2 text-green-500"
              />
              Secure Patient Records
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
          <Card className="card-hover shadow-brand text-center border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
              <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon
                  icon={faMicrophone}
                  className="w-8 h-8 text-white"
                />
              </div>
              <CardTitle className="text-brand-primary text-xl mb-3">
                Voice Recording
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Record clinical encounters directly in your browser with
                high-quality audio capture and real-time processing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover shadow-brand text-center border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
              <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon
                  icon={faFileText}
                  className="w-8 h-8 text-white"
                />
              </div>
              <CardTitle className="text-brand-primary text-xl mb-3">
                AI Structuring
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Automatically organize transcripts into standard clinical format
                with chief complaint, assessment, and plan sections
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover shadow-brand text-center border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
              <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="w-8 h-8 text-white"
                />
              </div>
              <CardTitle className="text-brand-primary text-xl mb-3">
                Patient Management
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Organize all patient encounters in one secure, searchable
                platform with comprehensive history tracking
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center py-16">
          <h2 className="text-4xl font-bold text-brand-primary mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Transform your clinical workflow in four simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="font-semibold text-brand-primary mb-3 text-lg">
                Record
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Speak your clinical notes naturally during or after patient
                encounters
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="font-semibold text-brand-primary mb-3 text-lg">
                Transcribe
              </h3>
              <p className="text-gray-600 leading-relaxed">
                AI converts your speech to accurate text using medical language
                models
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="font-semibold text-brand-primary mb-3 text-lg">
                Structure
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Smart AI organizes content into proper clinical documentation
                format
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                4
              </div>
              <h3 className="font-semibold text-brand-primary mb-3 text-lg">
                Save
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Securely store in patient records with easy search and retrieval
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16 bg-brand-primary rounded-3xl text-white my-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl mb-8 text-white/80 max-w-2xl mx-auto">
            Join healthcare professionals who are saving hours on documentation
            every week
          </p>
          <SignInButton mode="modal">
            <Button
              size="lg"
              className="bg-white text-brand-primary hover:bg-gray-100 text-lg px-8 py-4 shadow-lg"
            >
              <FontAwesomeIcon icon={faMicrophone} className="w-5 h-5 mr-3" />
              Get Started Now
            </Button>
          </SignInButton>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Image
                src="/logo.svg"
                alt="AaroNotes"
                width={140}
                height={32}
                className="h-8 w-auto mr-4"
              />
              <span className="text-gray-600">
                © 2025 AaroNotes. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="https://github.com/rishitdutta/aaronotes"
                target="_blank"
                className="flex items-center text-gray-600 hover:text-brand-primary transition-colors"
              >
                <FontAwesomeIcon icon={faGithub} className="w-5 h-5 mr-2" />
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
