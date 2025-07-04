"use client";

import { useState, useEffect } from "react";
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
import {
  faTimes,
  faPlus,
  faCheck,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

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
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false); // Load templates from localStorage and API on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      // First try to load from localStorage for immediate UI
      const savedTemplates = localStorage.getItem("aaronotes-templates");
      if (savedTemplates) {
        try {
          const parsedTemplates = JSON.parse(savedTemplates);
          setTemplates(parsedTemplates);
          setSelectedTemplate(parsedTemplates[0]);
        } catch (error) {
          console.error("Error loading templates from localStorage:", error);
        }
      }

      // Then load from API (for future when we have a proper backend)
      try {
        const response = await fetch("/api/templates");
        if (response.ok) {
          const apiTemplates = await response.json();
          if (apiTemplates.length > 0) {
            setTemplates(apiTemplates);
            setSelectedTemplate(apiTemplates[0]);
          }
        }
      } catch (error) {
        console.error("Error loading templates from API:", error);
        // Fall back to localStorage or default templates
      }
    };

    loadTemplates();
  }, []); // Empty dependency array for mount-only effect

  // Save templates to localStorage whenever templates change
  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem("aaronotes-templates", JSON.stringify(templates));
    }
  }, [templates]);

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
  const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
    setSelectedTemplate({
      ...selectedTemplate,
      fields: selectedTemplate.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    });
  };
  const toggleRequired = (fieldId: string) => {
    updateField(fieldId, {
      required: !selectedTemplate.fields.find((f) => f.id === fieldId)
        ?.required,
    });
  };

  const createNewTemplate = () => {
    if (newTemplateName.trim()) {
      const newTemplate = {
        id:
          newTemplateName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
        name: newTemplateName,
        fields: [
          {
            id: "chief_complaint",
            name: "Chief Complaint",
            description: "Primary reason for visit",
            required: true,
          },
        ] as TemplateField[],
      };

      setTemplates([...templates, newTemplate]);
      setSelectedTemplate(newTemplate);
      setNewTemplateName("");
      setShowNewTemplateForm(false);
    }
  };
  const saveTemplate = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      // Update the templates array with the current selected template
      const updatedTemplates = templates.map((template) =>
        template.id === selectedTemplate.id ? selectedTemplate : template
      );

      // Save to API
      const response = await fetch("/api/templates", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedTemplate),
      });
      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      await response.json();

      // Update local state
      setTemplates(updatedTemplates);

      setSaveMessage("Template saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving template:", error);
      setSaveMessage("Error saving template. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
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
        {/* Template Configuration */}{" "}
        <Card className="card-hover shadow-brand">
          <CardHeader>
            <CardTitle className="text-brand-primary">
              Note Template Configuration
            </CardTitle>
            <CardDescription>
              Define custom fields to extract from voice recordings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Selector */}
            <div>
              <Label className="mb-2 block">Select Template</Label>{" "}
              <div className="flex items-center gap-2">
                <select
                  value={selectedTemplate.id}
                  onChange={(e) => {
                    const template = templates.find(
                      (t) => t.id === e.target.value
                    );
                    if (template) setSelectedTemplate(template);
                  }}
                  className="flex-1 p-2 border rounded-lg"
                  aria-label="Select template"
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowNewTemplateForm(!showNewTemplateForm)}
                  className="btn-brand px-3 py-2 rounded-lg"
                  title="Create new template"
                  aria-label="Create new template"
                >
                  <FontAwesomeIcon icon={faPlus} size="sm" />
                </button>
              </div>
              {/* New Template Form */}
              {showNewTemplateForm && (
                <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                  <Label
                    htmlFor="new-template-name"
                    className="mb-1 block text-sm"
                  >
                    New Template Name
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-template-name"
                      placeholder="Template name"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                    />
                    <button
                      onClick={createNewTemplate}
                      disabled={!newTemplateName.trim()}
                      className="btn-brand px-3 py-2 rounded-lg disabled:opacity-50"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewTemplateForm(false);
                        setNewTemplateName("");
                      }}
                      className="px-3 py-2 border rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="template-name" className="mb-2 block">
                Template Name
              </Label>
              <Input
                id="template-name"
                value={selectedTemplate.name}
                onChange={(e) =>
                  setSelectedTemplate({
                    ...selectedTemplate,
                    name: e.target.value,
                  })
                }
                placeholder="Enter template name"
              />
            </div>
            <div className="space-y-3">
              <Label>Template Fields</Label>{" "}
              {selectedTemplate.fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <Input
                      value={field.name}
                      onChange={(e) =>
                        updateField(field.id, { name: e.target.value })
                      }
                      className="font-medium text-brand-primary border-0 p-0 h-auto bg-transparent"
                      placeholder="Field name"
                    />
                    <Input
                      value={field.description}
                      onChange={(e) =>
                        updateField(field.id, { description: e.target.value })
                      }
                      className="text-sm text-gray-600 border-0 p-0 h-auto bg-transparent"
                      placeholder="Field description"
                    />
                  </div>
                  <button
                    onClick={() => toggleRequired(field.id)}
                    className={`px-2 py-1 text-xs rounded ${
                      field.required
                        ? "bg-brand-icon text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {field.required ? "Required" : "Optional"}{" "}
                  </button>
                  <button
                    onClick={() => removeField(field.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    aria-label={`Remove ${field.name} field`}
                  >
                    <FontAwesomeIcon icon={faTimes} size="sm" />
                  </button>
                </div>
              ))}
            </div>{" "}
            <div className="border-t pt-4">
              <Label className="mb-3 block">Add New Field</Label>
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="new-field-name"
                    className="mb-1 block text-sm"
                  >
                    Field Name
                  </Label>
                  <Input
                    id="new-field-name"
                    placeholder="Field name (e.g., Allergies)"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="new-field-description"
                    className="mb-1 block text-sm"
                  >
                    Field Description
                  </Label>
                  <Textarea
                    id="new-field-description"
                    placeholder="Field description (e.g., Patient allergies and reactions)"
                    value={newFieldDescription}
                    onChange={(e) => setNewFieldDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <button
                  onClick={addField}
                  disabled={!newFieldName.trim()}
                  className="btn-brand flex items-center px-3 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>{" "}
            <div className="border-t pt-4">
              <button
                onClick={saveTemplate}
                disabled={isSaving}
                className={`btn-brand flex items-center px-4 py-2 rounded-lg font-medium transition-all w-full justify-center ${
                  isSaving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FontAwesomeIcon
                  icon={isSaving ? faSave : faCheck}
                  size="sm"
                  className={`mr-2 text-brand-icon ${
                    isSaving ? "animate-pulse" : ""
                  }`}
                />
                {isSaving ? "Saving..." : "Save Template"}
              </button>
              {saveMessage && (
                <div
                  className={`mt-2 text-sm text-center ${
                    saveMessage.includes("Error")
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {saveMessage}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Preview */}{" "}
        <Card className="card-hover shadow-brand">
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
