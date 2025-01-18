import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentationViewer from "../DocumentationViewer";
import { FileText, BookOpen, Info } from "lucide-react";

export const DocumentationSection = () => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const documentationLinks = [
    {
      title: "Equipment Management",
      description: "Learn how to track and maintain HVAC equipment details.",
      icon: FileText,
      path: "/docs/equipment-management.md",
    },
    {
      title: "Maintenance Checks",
      description: "Comprehensive guide for HVAC system maintenance checks.",
      icon: BookOpen,
      path: "/docs/maintenance-checks.md",
    },
    {
      title: "Project Management",
      description: "Guide for tracking and organizing maintenance projects.",
      icon: FileText,
      path: "/docs/project-management.md",
    },
    {
      title: "Technician Management",
      description: "Instructions for managing maintenance staff and assignments.",
      icon: Info,
      path: "/docs/technician-management.md",
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Documentation</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Access guides and documentation for system features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDoc ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-sm text-primary hover:underline mb-4"
              >
                ← Back to documentation list
              </button>
              <DocumentationViewer path={selectedDoc} />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {documentationLinks.map((doc) => (
                <button
                  key={doc.title}
                  onClick={() => setSelectedDoc(doc.path)}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors text-left w-full"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <doc.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{doc.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};