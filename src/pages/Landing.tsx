
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/landing.css";
import { authenticateUser } from "@/services/emailValidationService";

const Landing = () => {
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
      {/* Header */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="landing-nav__brand">
            <h1 className="logo">AssetGuardian</h1>
          </div>
          <div className="landing-nav__links">
            <Link to="/" className="landing-nav__link">Dashboard</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <h1 className="landing-hero__title">
            Smart <span className="landing-hero__title-highlight">Facility Management</span> for Modern Businesses
          </h1>
          <p className="landing-hero__subtitle">
            Streamline your maintenance workflows, track equipment health, and prevent costly downtime with our comprehensive facility management platform.
          </p>
          
          <div className="landing-hero__form">
            <form onSubmit={handleSubmit} className="landing-email-form">
              <div className="landing-email-form__wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  placeholder="Enter your work email to access the system"
                  className="landing-email-form__input"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="landing-email-form__button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Checking Access..." : "Access System"}
                </button>
              </div>
              
              {message && (
                <div className={`landing-form-message ${messageType}`}>
                  {message}
                </div>
              )}
            </form>
            
            <p className="landing-hero__form-note">
              Access restricted to authorized technicians and administrators
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-container">
          <div className="landing-section__header">
            <h2 className="landing-section__title">
              Everything you need to manage your facilities
            </h2>
            <p className="landing-section__subtitle">
              From preventive maintenance to real-time monitoring, AssetGuardian provides all the tools you need to keep your facilities running smoothly.
            </p>
          </div>
          
          <div className="landing-features__grid">
            <div className="landing-feature">
              <i className="fas fa-tools landing-feature__icon"></i>
              <h3 className="landing-feature__title">Maintenance Management</h3>
              <p className="landing-feature__description">
                Schedule, track, and manage all maintenance activities with automated workflows and real-time updates.
              </p>
            </div>
            
            <div className="landing-feature">
              <i className="fas fa-chart-line landing-feature__icon"></i>
              <h3 className="landing-feature__title">Analytics & Reporting</h3>
              <p className="landing-feature__description">
                Get insights into equipment performance, maintenance costs, and operational efficiency with detailed analytics.
              </p>
            </div>
            
            <div className="landing-feature">
              <i className="fas fa-mobile-alt landing-feature__icon"></i>
              <h3 className="landing-feature__title">Mobile Access</h3>
              <p className="landing-feature__description">
                Access your facility data anywhere, anytime with our mobile-optimized platform and responsive design.
              </p>
            </div>
            
            <div className="landing-feature">
              <i className="fas fa-shield-alt landing-feature__icon"></i>
              <h3 className="landing-feature__title">Compliance Tracking</h3>
              <p className="landing-feature__description">
                Stay compliant with industry regulations and standards through automated documentation and audit trails.
              </p>
            </div>
            
            <div className="landing-feature">
              <i className="fas fa-users landing-feature__icon"></i>
              <h3 className="landing-feature__title">Team Collaboration</h3>
              <p className="landing-feature__description">
                Coordinate with your team efficiently through shared workspaces, notifications, and communication tools.
              </p>
            </div>
            
            <div className="landing-feature">
              <i className="fas fa-cog landing-feature__icon"></i>
              <h3 className="landing-feature__title">Equipment Monitoring</h3>
              <p className="landing-feature__description">
                Monitor equipment health in real-time and receive alerts before issues become costly problems.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
