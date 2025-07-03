
import { useEffect, useState } from "react";
import "../styles/landing.css";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { AccessRequestModal } from "@/components/landing/AccessRequestModal";
import { ChatWidget } from "@/components/chatbot/ChatWidget";
import { useLandingForm } from "@/hooks/useLandingForm";

const Landing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    formData,
    message,
    messageType,
    isSubmitting,
    handleSubmit,
    handleInputChange
  } = useLandingForm();

  useEffect(() => {
    // Add intersection observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const animatedElements = document.querySelectorAll(".landing-feature");
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <LandingHeader />
      <LandingHero onRequestAccess={() => setIsModalOpen(true)} />
      <LandingFeatures />
      <AccessRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        message={message}
        messageType={messageType}
        isSubmitting={isSubmitting}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
      <ChatWidget />
    </div>
  );
};

export default Landing;
