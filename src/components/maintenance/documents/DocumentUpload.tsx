
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface DocumentUploadProps {
  equipmentId?: string;
  maintenanceCheckId?: string;
  onUploadComplete?: () => void;
}

const DocumentUpload = ({ 
  equipmentId, 
  maintenanceCheckId, 
  onUploadComplete 
}: DocumentUploadProps) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [category, setCategory] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    validateAndSetFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    validateAndSetFiles(selectedFiles);
  };

  const validateAndSetFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const invalidFiles = Array.from(fileList).filter(
      file => !ALLOWED_FILE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE
    );

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid files detected",
        description: "Please ensure all files are of the correct type and under 10MB",
        variant: "destructive",
      });
      return;
    }

    setFiles(fileList);
  };

  const uploadFiles = async () => {
    if (!files || !category) {
      toast({
        title: "Missing information",
        description: "Please select files and a category",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('maintenance_docs')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('maintenance_documents')
          .insert({
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            category,
            equipment_id: equipmentId,
            maintenance_check_id: maintenanceCheckId,
            comments,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Success",
        description: "Documents uploaded successfully",
      });

      setFiles(null);
      setCategory("");
      setComments("");
      setTags("");
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, JPG, PNG, DOCX, XLSX (Max 10MB)
          </p>
        </div>
        <Input
          type="file"
          multiple
          accept={ALLOWED_FILE_TYPES.join(",")}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <Button
          className="mt-4 bg-blue-900 hover:bg-blue-800 text-white"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          Select Files
        </Button>
      </div>

      {files && Array.from(files).map((file, index) => (
        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <File className="h-4 w-4" />
          <span className="text-sm">{file.name}</span>
        </div>
      ))}

      <div className="space-y-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="service_record">Service Record</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="inspection">Inspection Report</SelectItem>
            <SelectItem value="compliance">Compliance Document</SelectItem>
            <SelectItem value="warranty">Warranty</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <Textarea
          placeholder="Comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />

        <Button
          onClick={uploadFiles}
          disabled={!files || isUploading}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white"
        >
          {isUploading ? "Uploading..." : "Upload Documents"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;
