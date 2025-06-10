
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { MaintenanceDocument } from "@/types/maintenance";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentActionsProps {
  document: MaintenanceDocument;
  onDownload: (doc: MaintenanceDocument) => Promise<void>;
  onDelete: (doc: MaintenanceDocument) => Promise<void>;
}

export const DocumentActions = ({ document, onDownload, onDelete }: DocumentActionsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size={isMobile ? "sm" : "icon"}
        onClick={() => onDownload(document)}
        className="h-8 w-8 bg-blue-900 hover:bg-blue-800 text-white border-blue-900"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size={isMobile ? "sm" : "icon"}
        onClick={() => onDelete(document)}
        className="h-8 w-8 bg-blue-900 hover:bg-blue-800 text-white border-blue-900"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
