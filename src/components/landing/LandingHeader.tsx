
import { Link } from "react-router-dom";

export const LandingHeader = () => {
  return (
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
  );
};
