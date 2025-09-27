import { Link } from "react-router-dom";

export const LandingFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__content">
        <div className="landing-footer__brand">
          <img 
            src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
            alt="AssetGuardian.ai Logo" 
            className="brand-logo" 
          />
          <h2 className="logo">AssetGuardian.ai</h2>
        </div>
        
        <p className="landing-footer__tagline">
          Predictive Maintenance & Technician Assist for Facilities
        </p>
        
        <nav className="landing-footer__nav">
          <Link to="/solutions">Solutions</Link>
          <Link to="/product">Product</Link>
          <Link to="/results">Results</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/about">About</Link>
          <Link to="/book-demo">Book Demo</Link>
        </nav>
        
        <div className="landing-footer__bottom">
          <p>© 2024 AssetGuardian.ai. Empowering maintenance teams across retail, schools, hospitals, and HVAC companies.</p>
        </div>
      </div>
    </footer>
  );
};