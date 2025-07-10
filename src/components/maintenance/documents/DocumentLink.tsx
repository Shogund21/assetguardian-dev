import { File, Download, Trash2 } from "lucide-react";
import { MaintenanceDocument } from "@/types/maintenance";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DocumentLinkProps {
  document: MaintenanceDocument;
  onDownload: (doc: MaintenanceDocument) => Promise<void>;
  onDelete: (doc: MaintenanceDocument) => Promise<void>;
}

export const DocumentLink = ({ document, onDownload, onDelete }: DocumentLinkProps) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      await onDownload(document);
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "Unable to download the document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(document);
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Delete failed",
        description: "Unable to delete the document",
        variant: "destructive",
      });
    }
  };

  // Format date and time
  const uploadDate = new Date(document.uploaded_at);
  const formattedDate = uploadDate.toLocaleDateString();
  const formattedTime = uploadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{document.file_name}</p>
          <p className="text-xs text-muted-foreground">
            {formattedDate} • {formattedTime}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="h-8 w-8 p-0"
        >
          <Download className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};