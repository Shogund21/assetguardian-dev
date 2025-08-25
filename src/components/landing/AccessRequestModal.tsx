import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LandingEmailForm } from "./LandingEmailForm";

interface AccessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    company: string;
    reason: string;
  };
  message: string;
  messageType: "success" | "error" | "info" | "";
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AccessRequestModal = ({
  isOpen,
  onClose,
  formData,
  message,
  messageType,
  isSubmitting,
  onInputChange,
  onSubmit
}: AccessRequestModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Start Your No-Risk 90-Day Pilot
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Fill out the form below and our team will set up your pilot program.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <LandingEmailForm
            formData={formData}
            message={message}
            messageType={messageType}
            isSubmitting={isSubmitting}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};