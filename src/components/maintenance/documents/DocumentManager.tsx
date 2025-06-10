
import { useState } from "react";
import { Button } from "@/components/ui/button";
import DocumentUpload from "./DocumentUpload";
import DocumentList from "./DocumentList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentManagerProps {
  equipmentId?: string;
  maintenanceCheckId?: string;
  isRepositoryView?: boolean;
}

const DocumentManager = ({ 
  equipmentId, 
  maintenanceCheckId,
  isRepositoryView = false
}: DocumentManagerProps) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const isMobile = useIsMobile();

  const categories = [
    { id: "all", name: "All Documents" },
    { id: "manual", name: "Manuals" },
    { id: "service_record", name: "Service Records" },
    { id: "invoice", name: "Invoices" },
    { id: "inspection", name: "Inspection Reports" },
    { id: "compliance", name: "Compliance" },
    { id: "warranty", name: "Warranties" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold`}>
          {isRepositoryView ? "Document Repository" : "Documents"}
        </h2>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <Button 
            className={`${isMobile ? "px-3 py-1 h-8" : ""} bg-blue-900 hover:bg-blue-800 text-white`}
            size={isMobile ? "sm" : "default"}
            onClick={() => setIsUploadOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            {isMobile ? "" : "Upload"}
          </Button>
          <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
            </DialogHeader>
            <DocumentUpload
              equipmentId={equipmentId}
              maintenanceCheckId={maintenanceCheckId}
              onUploadComplete={() => setIsUploadOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isRepositoryView && (
        <Tabs 
          defaultValue="all" 
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className={`${isMobile ? 'flex-wrap min-w-max' : ''}`}>
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className={`${isMobile ? 'text-xs py-1 px-2' : ''}`}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value={activeCategory} className="mt-4">
            <DocumentList
              equipmentId={equipmentId}
              maintenanceCheckId={maintenanceCheckId}
              category={activeCategory !== "all" ? activeCategory : undefined}
            />
          </TabsContent>
        </Tabs>
      )}

      {!isRepositoryView && (
        <DocumentList
          equipmentId={equipmentId}
          maintenanceCheckId={maintenanceCheckId}
        />
      )}
    </div>
  );
};

export default DocumentManager;
