
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MaintenanceDocument } from "@/types/maintenance";
import { DocumentLink } from "./DocumentLink";
import { fetchDocuments, downloadDocument, deleteDocument } from "./documentUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentListProps {
  equipmentId?: string;
  maintenanceCheckId?: string;
  category?: string;
}

const DocumentList = ({ equipmentId, maintenanceCheckId, category }: DocumentListProps) => {
  const [documents, setDocuments] = useState<MaintenanceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await fetchDocuments(equipmentId, maintenanceCheckId, category);
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: MaintenanceDocument) => {
    try {
      await downloadDocument(doc);
      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (doc: MaintenanceDocument) => {
    try {
      await deleteDocument(doc);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [equipmentId, maintenanceCheckId, category]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-gray-500">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.length > 0 ? (
        documents.map((document) => (
          <DocumentLink
            key={document.id}
            document={document}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No documents found
        </div>
      )}
    </div>
  );
};

export default DocumentList;
