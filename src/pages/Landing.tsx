
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
            <img 
              src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
              alt="Asset Guardian Logo" 
              className="h-8 w-8 mr-3" 
            />
            <h1 className="logo">Asset Guardian</h1>
          </div>
          <div className="landing-nav__links">
            <Link to="/" className="landing-nav__link">Dashboard</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          {/* Logo prominently displayed */}
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
              alt="Asset Guardian Logo" 
              className="h-20 w-20 mb-4" 
            />
          </div>
          
          <h1 className="landing-hero__title">
            AI-Powered <span className="landing-hero__title-highlight">Predictive Maintenance</span> Platform
          </h1>
          <p className="landing-hero__subtitle">
            Transform your facility management with cutting-edge AI that predicts failures before they happen, optimizes maintenance schedules, and prevents costly downtime with surgical precision.
          </p>
          
          <div className="landing-hero__form">
            <form onSubmit={handleSubmit} className="landing-email-form">
              <div className="landing-email-form__wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  placeholder="Enter your work email to access the AI platform"
                  className="landing-email-form__input"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="landing-email-form__button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Analyzing Access..." : "Access AI Platform"}
                </button>
              </div>
              
              {message && (
                <div className={`landing-form-message ${messageType}`}>
                  {message}
                </div>
              )}
            </form>
            
            <p className="landing-hero__form-note">
              Enterprise-grade AI platform • Authorized technicians and facility managers only
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-container">
          <div className="landing-section__header">
            <h2 className="landing-section__title">
              Revolutionary AI Technology That Changes Everything
            </h2>
            <p className="landing-section__subtitle">
              Experience the future of facility management with our breakthrough AI that learns your equipment patterns, predicts failures with 95% accuracy, and optimizes your entire operation automatically.
            </p>
          </div>
          
          <div className="landing-features__grid">
            <div className="landing-feature">
              <i className="fas fa-brain landing-feature__icon"></i>
              <h3 className="landing-feature__title">AI Failure Prediction</h3>
              <p className="landing-feature__description">
                Our neural networks analyze sensor data in real-time to predict equipment failures 2-8 weeks in advance with surgical precision, saving you millions in unexpected downtime.
              </p>
            </div>
            
            <div className="landing-feature">
              <i className="fas fa-clock landing-feature__icon"></i>
              <h3 className="landing-feature__title">Optimal Maintenance Windows</h3>
              <p className="landing-feature__description">
                AI automatically identifies the perfect maintenance windows based on equipment load, seasonal patterns, and operational schedules to minimize business impact.
              </p>
            </div>
            
            <div className="landing-feature">
              <i className="fas fa-chart-line landing-feature__icon"></i>
              <h3 className="landing-feature__title">Performance Degradation Analysis</h3>
              <p className="landing-feature__description">
                Advanced algorithms detect subtle performance declines invisible to human analysis, tracking efficiency trends and energy consumption patterns over time.
              </p>
            </div>
            
            <div className="landing-feature">
              <i className="fas fa-dollar-sign landing-feature__icon"></i>
              <h3 className="landing-feature__title">Cost Optimization Engine</h3>
              <p className="landing-feature__description">
                Machine learning algorithms calculate the optimal balance between maintenance costs and equipment lifespan, automatically scheduling interventions for maximum ROI.
              </p>
            </div>
            
            <div className="landing-feature">
              <i className="fas fa-thermometer-half landing-feature__icon"></i>
              <h3 className="landing-feature__title">Real-Time Sensor Integration</h3>
              <p className="landing-feature__description">
                Seamlessly connects with IoT sensors, HVAC systems, and industrial equipment to create a unified digital twin of your entire facility ecosystem.
              </p>
            </div>
            
            <div className="landing-feature">
              <i className="fas fa-shield-alt landing-feature__icon"></i>
              <h3 className="landing-feature__title">Predictive Risk Assessment</h3>
              <p className="landing-feature__description">
                AI-powered risk scoring system evaluates equipment health across multiple dimensions, providing actionable insights for strategic maintenance planning.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="landing-stats">
            <div className="landing-stats__grid">
              <div className="landing-stat">
                <div className="landing-stat__number">95%</div>
                <div className="landing-stat__label">Prediction Accuracy</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat__number">67%</div>
                <div className="landing-stat__label">Downtime Reduction</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat__number">$2.3M</div>
                <div className="landing-stat__label">Average Annual Savings</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat__number">24/7</div>
                <div class="landing-stat__label">AI Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
