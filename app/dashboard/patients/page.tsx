"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Patient {
  id: string;
  name: string;
  dateOfBirth?: Date;
  gender?: string;
  contact?: string;
  encounters?: Array<{
    id: string;
    createdAt: string;
  }>;
}

export default function PatientsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    contact: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients");
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newPatient = await response.json();
        setPatients([newPatient, ...patients]);
        setIsDialogOpen(false);
        setFormData({ name: "", dateOfBirth: "", gender: "", contact: "" });
      }
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("Failed to create patient. Please try again.");
    }
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary mb-3">
            Patients
          </h1>
          <p className="text-gray-600">Manage your patient roster</p>
        </div>{" "}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-brand flex items-center px-6 py-3 rounded-xl font-medium transition-all shadow-sm">
              <FontAwesomeIcon
                icon={faPlus}
                className="w-4 h-4 mr-3 text-brand-icon"
              />
              Add Patient
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-brand-primary">
                Add New Patient
              </DialogTitle>
              <DialogDescription>
                Enter the patient&apos;s information to create a new record.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter patient name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="w-full p-2 border rounded-md"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    aria-label="Select gender"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    placeholder="Phone or email"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-brand-primary hover:bg-gray-50 transition-colors"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brand px-4 py-2 rounded-lg font-medium transition-all"
                >
                  Add Patient
                </button>
              </div>{" "}
            </form>
          </DialogContent>
        </Dialog>
      </div>{" "}
      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {" "}
        {patients.map((patient: Patient) => (
          <Link key={patient.id} href={`/dashboard/patients/${patient.id}`}>
            <Card className="card-hover shadow-brand cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-brand-primary">
                      {patient.name}
                    </CardTitle>
                    <CardDescription>
                      {patient.dateOfBirth
                        ? `Age ${calculateAge(patient.dateOfBirth)} • ${
                            patient.gender || "Gender not specified"
                          }`
                        : patient.gender || "No additional info"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-brand-primary">
                    {patient.encounters?.length || 0} notes
                  </Badge>
                </div>{" "}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Contact: {patient.contact || "Not provided"}</div>
                  <div>
                    Last visit:{" "}
                    {patient.encounters && patient.encounters.length > 0
                      ? new Date(
                          patient.encounters[0].createdAt
                        ).toLocaleDateString()
                      : "No visits yet"}
                  </div>
                </div>{" "}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>{" "}
      {patients.length === 0 && (
        <Card className="card-hover shadow-brand">
          <CardContent className="text-center py-12">
            <FontAwesomeIcon
              icon={faUserPlus}
              size="3x"
              className="text-brand-icon mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-brand-primary mb-2">
              No patients yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first patient
            </p>{" "}
            <button
              onClick={() => setIsDialogOpen(true)}
              className="btn-brand flex items-center px-4 py-2 rounded-lg font-medium transition-all mx-auto"
            >
              <FontAwesomeIcon
                icon={faPlus}
                size="sm"
                className="mr-2 text-brand-icon"
              />
              Add Your First Patient
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
