"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faChevronDown, faPlus } from "@fortawesome/free-solid-svg-icons";

interface Patient {
  id: string;
  name: string;
  dateOfBirth?: string;
  createdAt: string;
}

interface PatientSelectorProps {
  selectedPatientId?: string;
  selectedPatientName?: string;
  onPatientSelect: (patient: Patient | null) => void;
  onNewPatientName: (name: string) => void;
}

export default function PatientSelector({
  selectedPatientId,
  selectedPatientName,
  onPatientSelect,
  onNewPatientName,
}: PatientSelectorProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState(selectedPatientName || "");
  const [isCreatingNew, setIsCreatingNew] = useState(!selectedPatientId);
  const [loading, setLoading] = useState(true);

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

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setIsCreatingNew(false);
    setIsDropdownOpen(false);
    setNewPatientName("");
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    onPatientSelect(null);
    setIsDropdownOpen(false);
  };

  const handleNewPatientNameChange = (name: string) => {
    setNewPatientName(name);
    onNewPatientName(name);
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        Patient
      </label>
      
      {isCreatingNew ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter new patient name"
            value={newPatientName}
            onChange={(e) => handleNewPatientNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-sm text-brand-primary hover:text-brand-primary/80 flex items-center"
            >
              <FontAwesomeIcon icon={faUser} className="w-3 h-3 mr-1" />
              Select existing patient
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          >
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-2 text-gray-400" />
              <span>{selectedPatient ? selectedPatient.name : "Select a patient"}</span>
            </div>
            <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <button
            type="button"
            onClick={handleCreateNew}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center text-brand-primary border-b border-gray-100"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
            Create new patient
          </button>
          
          {patients.length > 0 ? (
            patients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => handlePatientSelect(patient)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900">{patient.name}</div>
                  <div className="text-sm text-gray-500">
                    Added {new Date(patient.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No patients found
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
