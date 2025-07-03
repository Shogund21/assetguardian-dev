
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticateUser } from "@/services/emailValidationService";
import { supabase } from "@/integrations/supabase/client";

export const useLandingForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
    reason: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showMessage = (msg: string, type: "success" | "error" | "info") => {
    setMessage(msg);
    setMessageType(type);
    
    if (type === "success") {
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setMessage("");
    setMessageType("");
    
    // Validate required fields
    if (!formData.email.trim()) {
      showMessage("Please enter your email address.", "error");
      return;
    }
    
    if (!emailRegex.test(formData.email)) {
      showMessage("Please enter a valid email address.", "error");
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showMessage("Please enter your first and last name.", "error");
      return;
    }

    if (!formData.company.trim()) {
      showMessage("Please enter your company/organization.", "error");
      return;
    }

    if (!formData.reason.trim()) {
      showMessage("Please describe why you need access.", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Attempting access request for:", formData.email);
      
      // Check if this is the admin email - give immediate access
      if (formData.email.toLowerCase() === "edward@shogunai.com") {
        const result = await authenticateUser(formData.email);
        
        if (result.success) {
          showMessage(`Access granted! Redirecting to dashboard...`, "success");
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
          return;
        }
      }
      
      // For all other users, create an access request
      const { error } = await supabase
        .from('access_requests')
        .insert([{
          email: formData.email.toLowerCase(),
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || null,
          company: formData.company,
          reason: formData.reason
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          showMessage("An access request with this email already exists. Please wait for approval.", "info");
        } else {
          throw error;
        }
      } else {
        showMessage(`Access request submitted successfully! Your request will be reviewed and you'll be contacted via email.`, "success");
        
        // Reset form
        setFormData({
          email: "",
          firstName: "",
          lastName: "",
          phone: "",
          company: "",
          reason: ""
        });
      }
    } catch (error) {
      console.error("Access request error:", error);
      showMessage("An error occurred while submitting your request. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error messages while typing
    if (messageType === "error") {
      setMessage("");
      setMessageType("");
    }
  };

  return {
    formData,
    message,
    messageType,
    isSubmitting,
    handleSubmit,
    handleInputChange
  };
};
