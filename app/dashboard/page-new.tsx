"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faUsers,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { Sparklines, SparklinesLine } from "react-sparklines";

export default function DashboardPage() {
  // Sample data for recent patients
  const recentPatients = [
    { id: 1, name: "John Smith", lastUpdated: "2 hours ago" },
    { id: 2, name: "Sarah Johnson", lastUpdated: "4 hours ago" },
    { id: 3, name: "Michael Brown", lastUpdated: "1 day ago" },
    { id: 4, name: "Emily Davis", lastUpdated: "2 days ago" },
    { id: 5, name: "David Wilson", lastUpdated: "3 days ago" },
    { id: 6, name: "Lisa Miller", lastUpdated: "1 week ago" },
  ];

  // Sample data for sparklines
  const patientsData = [12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45];
  const encountersData = [5, 8, 12, 15, 18, 22, 25, 28, 32, 35, 38];
  const sessionsData = [2, 4, 6, 8, 12, 15, 18, 20, 25, 28, 30];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary mb-3">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here&apos;s an overview of your clinical activities.
        </p>
      </div>

      {/* Top Section - Purple Banner */}
      <div className="bg-gradient-to-r from-brand-primary to-purple-600 rounded-3xl p-8 text-white shadow-brand-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Start New Encounter</h2>
            <p className="text-purple-100 mb-6">
              Record a new patient session or upload existing audio files
            </p>
            <Link
              href="/dashboard/encounters/new"
              className="inline-flex items-center bg-white text-brand-primary px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faPlus} className="w-5 h-5 mr-3" />
              Start Encounter
            </Link>
          </div>
          <div className="flex-1 flex justify-end">
            {/* Space for future graphic */}
            <div className="w-64 h-32 bg-white/10 rounded-2xl flex items-center justify-center text-purple-200">
              <span className="text-sm">Graphic Space</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Patients - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="card-hover shadow-brand">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-brand-primary flex items-center text-xl">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="w-6 h-6 mr-3 text-brand-icon"
                  />
                  Recent Patients
                </CardTitle>
                <Link
                  href="/dashboard/patients"
                  className="text-brand-primary hover:text-brand-secondary transition-colors font-medium flex items-center"
                >
                  View All
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="w-4 h-4 ml-2"
                  />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Last updated: {patient.lastUpdated}
                        </p>
                      </div>
                    </div>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-4 h-4 text-gray-400"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards - Takes 1 column */}
        <div className="space-y-6">
          {/* Total Patients */}
          <Card className="card-hover shadow-brand">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Total Patients
                  </p>
                  <p className="text-3xl font-bold text-brand-primary">45</p>
                  <p className="text-xs text-green-600 mt-1">+12% this month</p>
                </div>
                <div className="w-16 h-12">
                  <Sparklines data={patientsData} width={64} height={48}>
                    <SparklinesLine
                      color="#715096"
                      style={{ strokeWidth: 2, fill: "none" }}
                    />
                  </Sparklines>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Encounters */}
          <Card className="card-hover shadow-brand">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Total Encounters
                  </p>
                  <p className="text-3xl font-bold text-brand-primary">128</p>
                  <p className="text-xs text-green-600 mt-1">+8% this week</p>
                </div>
                <div className="w-16 h-12">
                  <Sparklines data={encountersData} width={64} height={48}>
                    <SparklinesLine
                      color="#997abc"
                      style={{ strokeWidth: 2, fill: "none" }}
                    />
                  </Sparklines>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recording Sessions */}
          <Card className="card-hover shadow-brand">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Recording Sessions
                  </p>
                  <p className="text-3xl font-bold text-brand-primary">30</p>
                  <p className="text-xs text-green-600 mt-1">+15% today</p>
                </div>
                <div className="w-16 h-12">
                  <Sparklines data={sessionsData} width={64} height={48}>
                    <SparklinesLine
                      color="#a855f7"
                      style={{ strokeWidth: 2, fill: "none" }}
                    />
                  </Sparklines>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
