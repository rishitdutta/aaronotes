"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";

interface TemplateField {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export default function SettingsPage() {
  const [templates, setTemplates] = useState([
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
      ] as TemplateField[],
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldDescription, setNewFieldDescription] = useState("");

  const addField = () => {
    if (newFieldName.trim()) {
      const newField: TemplateField = {
        id: newFieldName.toLowerCase().replace(/\s+/g, "_"),
        name: newFieldName,
        description: newFieldDescription,
        required: false,
      };

      setSelectedTemplate({
        ...selectedTemplate,
        fields: [...selectedTemplate.fields, newField],
      });

      setNewFieldName("");
      setNewFieldDescription("");
    }
  };

  const removeField = (fieldId: string) => {
    setSelectedTemplate({
      ...selectedTemplate,
      fields: selectedTemplate.fields.filter((field) => field.id !== fieldId),
    });
  };

  const toggleRequired = (fieldId: string) => {
    setSelectedTemplate({
      ...selectedTemplate,
      fields: selectedTemplate.fields.map((field) =>
        field.id === fieldId ? { ...field, required: !field.required } : field
      ),
    });
  };

  const saveTemplate = () => {
    setTemplates(
      templates.map((template) =>
        template.id === selectedTemplate.id ? selectedTemplate : template
      )
    );
    // Here you would save to your backend
    alert("Template saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-primary">Settings</h1>
        <p className="text-gray-600 mt-2">
          Customize your note templates and extraction fields
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-primary">
              Note Template Configuration
            </CardTitle>
            <CardDescription>
              Define custom fields to extract from voice recordings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={selectedTemplate.name}
                onChange={(e) =>
                  setSelectedTemplate({
                    ...selectedTemplate,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-3">
              <Label>Template Fields</Label>
              {selectedTemplate.fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-brand-primary">
                      {field.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {field.description}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRequired(field.id)}
                    className={`px-2 py-1 text-xs rounded ${
                      field.required
                        ? "bg-brand-icon text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {field.required ? "Required" : "Optional"}
                  </button>{" "}
                  <button
                    onClick={() => removeField(field.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    aria-label={`Remove ${field.name} field`}
                  >
                    <FontAwesomeIcon icon={faTimes} size="sm" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <Label>Add New Field</Label>
              <div className="space-y-2 mt-2">
                <Input
                  placeholder="Field name (e.g., Allergies)"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                />
                <Textarea
                  placeholder="Field description (e.g., Patient allergies and reactions)"
                  value={newFieldDescription}
                  onChange={(e) => setNewFieldDescription(e.target.value)}
                  rows={2}
                />{" "}
                <button
                  onClick={addField}
                  className="btn-brand flex items-center px-3 py-2 rounded-lg font-medium transition-all"
                >
                  {" "}
                  <FontAwesomeIcon
                    icon={faPlus}
                    size="sm"
                    className="mr-2 text-brand-icon"
                  />
                  Add Field
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              {" "}
              <button
                onClick={saveTemplate}
                className="btn-brand flex items-center px-4 py-2 rounded-lg font-medium transition-all w-full justify-center"
              >
                {" "}
                <FontAwesomeIcon
                  icon={faCheck}
                  size="sm"
                  className="mr-2 text-brand-icon"
                />
                Save Template
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-primary">
              Template Preview
            </CardTitle>
            <CardDescription>How your note will be structured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-brand-primary mb-3">
                  {selectedTemplate.name}
                </h3>
                {selectedTemplate.fields.map((field) => (
                  <div key={field.id} className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-brand-primary">
                        {field.name}
                      </span>
                      {field.required && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {field.description}
                    </p>
                    <div className="h-8 bg-white border border-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
