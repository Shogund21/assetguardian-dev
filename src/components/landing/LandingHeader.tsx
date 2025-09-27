
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const LandingHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="landing-nav">
        <div className="landing-nav__brand">
          <img 
            src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
            alt="AssetGuardian.ai Logo - Predictive Maintenance Platform" 
            className="brand-logo" 
          />
          <h1 className="logo">AssetGuardian.ai</h1>
        </div>
        <div className="landing-nav__links hidden md:flex space-x-6 items-center">
          <Link to="/landing" className="text-white hover:text-yellow-400 transition-colors">
            Home
          </Link>
          <Link to="/solutions" className="text-white hover:text-yellow-400 transition-colors">
            Solutions
          </Link>
          <Link to="/product" className="text-white hover:text-yellow-400 transition-colors">
            Product
          </Link>
          <Link to="/results" className="text-white hover:text-yellow-400 transition-colors">
            Results
          </Link>
          <Link to="/pricing" className="text-white hover:text-yellow-400 transition-colors">
            Pricing
          </Link>
          <Link to="/resources" className="text-white hover:text-yellow-400 transition-colors">
            Resources
          </Link>
          <Link to="/about" className="text-white hover:text-yellow-400 transition-colors">
            About
          </Link>
          <Link 
            to="/book-demo" 
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors ml-4"
          >
            Book Demo
          </Link>
        </div>
      </nav>
    </header>
  );
};
