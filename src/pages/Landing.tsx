
import { useEffect } from "react";
import "../styles/landing.css";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { useLandingForm } from "@/hooks/useLandingForm";

const Landing = () => {
  const {
    email,
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
      <LandingHero
        email={email}
        message={message}
        messageType={messageType}
        isSubmitting={isSubmitting}
        onEmailChange={handleInputChange}
        onSubmit={handleSubmit}
      />
      <LandingFeatures />
    </div>
  );
};

export default Landing;
