
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentationViewer from "../DocumentationViewer";
import { FileText, BookOpen, Info, Brain } from "lucide-react";

export const DocumentationSection = () => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const documentationLinks = [
    {
      title: "Equipment Management",
      description: "Learn how to track and maintain equipment details with AssetGuardian.",
      icon: FileText,
      path: "/docs/equipment-management.md",
    },
    {
      title: "Maintenance Checks",
      description: "Comprehensive guide for system maintenance checks.",
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
    {
      title: "Predictive Maintenance",
      description: "Complete guide for manual readings, AI analysis, and predictive maintenance.",
      icon: Brain,
      path: "/docs/predictive-maintenance.md",
    },
    {
      title: "Settings Management",
      description: "Comprehensive guide for managing system settings, locations, and companies.",
      icon: FileText,
      path: "/docs/settings-management.md",
    },
    {
      title: "Authentication Guide",
      description: "User management, access requests, and authentication system guide.",
      icon: Info,
      path: "/docs/authentication-guide.md",
    },
    {
      title: "Mobile Usage Guide",
      description: "Complete guide for using Asset Guardian on mobile devices.",
      icon: FileText,
      path: "/docs/mobile-usage-guide.md",
    },
    {
      title: "Administrator Features",
      description: "Administrative tools, user management, and system oversight guide.",
      icon: Info,
      path: "/docs/admin-features.md",
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Documentation</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Access guides and documentation for Shogunai's AssetGuardian system features.
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
