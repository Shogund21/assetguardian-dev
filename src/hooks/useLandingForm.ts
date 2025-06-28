
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticateUser } from "@/services/emailValidationService";

export const useLandingForm = () => {
  const [email, setEmail] = useState("");
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
    
    if (!email.trim()) {
      showMessage("Please enter your email address.", "error");
      return;
    }
    
    if (!emailRegex.test(email)) {
      showMessage("Please enter a valid email address.", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Attempting authentication for:", email);
      const result = await authenticateUser(email);
      
      if (result.success) {
        showMessage(`Access granted! Redirecting to dashboard...`, "success");
        
        // Use a more reliable navigation approach
        setTimeout(() => {
          // Force navigation to root and reload to ensure auth state is picked up
          window.location.href = "/";
        }, 1000);
      } else {
        showMessage(result.error || "Access denied. This email is not authorized.", "error");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      showMessage("An error occurred. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    // Clear error messages while typing
    if (messageType === "error") {
      setMessage("");
      setMessageType("");
    }
  };

  return {
    email,
    message,
    messageType,
    isSubmitting,
    handleSubmit,
    handleInputChange
  };
};
