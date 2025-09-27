
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export const LandingHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <Link to="/landing" className="text-gray-900 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/solutions" className="text-gray-900 hover:text-primary transition-colors">
            Solutions
          </Link>
          <Link to="/product" className="text-gray-900 hover:text-primary transition-colors">
            Product
          </Link>
          <Link to="/results" className="text-gray-900 hover:text-primary transition-colors">
            Results
          </Link>
          <Link to="/pricing" className="text-gray-900 hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link to="/resources" className="text-gray-900 hover:text-primary transition-colors">
            Resources
          </Link>
          <Link to="/about" className="text-gray-900 hover:text-primary transition-colors">
            About
          </Link>
          <Link 
            to="/auth" 
            className="text-gray-900 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors ml-4"
          >
            Sign In
          </Link>
          <Link 
            to="/book-demo" 
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors ml-2"
          >
            Book Demo
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50">
            <div className="flex flex-col space-y-4 p-6">
              <Link 
                to="/landing" 
                className="text-gray-900 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/solutions" 
                className="text-gray-900 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              <Link 
                to="/product" 
                className="text-gray-900 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Product
              </Link>
              <Link 
                to="/results" 
                className="text-gray-900 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Results
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-900 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/resources" 
                className="text-gray-900 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                to="/about" 
                className="text-gray-900 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link 
                  to="/auth" 
                  className="block text-center text-gray-900 border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/book-demo" 
                  className="block text-center bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Book Demo
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
