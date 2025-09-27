
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
          <h1 className="logo">AssetGuardian.ai</h1>
        </div>
        <div className="landing-nav__links hidden md:flex space-x-8 items-center">
          <Link to="/features" className="text-white hover:text-yellow-400 transition-colors">
            Features
          </Link>
          <Link to="/ai-vs-traditional" className="text-white hover:text-yellow-400 transition-colors">
            AI vs Traditional
          </Link>
          <Link to="/use-cases" className="text-white hover:text-yellow-400 transition-colors">
            Use Cases
          </Link>
          <Link to="/about" className="text-white hover:text-yellow-400 transition-colors">
            About
          </Link>
          <Link 
            to="/auth" 
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors ml-4"
          >
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
};
