
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
            to="/auth" 
            className="text-white border border-white/30 px-4 py-2 rounded-lg font-medium hover:bg-white/10 hover:border-white/50 transition-colors ml-4"
          >
            Sign In
          </Link>
          <Link 
            to="/book-demo" 
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors ml-2"
          >
            Book Demo
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10 z-50">
            <div className="flex flex-col space-y-4 p-6">
              <Link 
                to="/landing" 
                className="text-white hover:text-yellow-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/solutions" 
                className="text-white hover:text-yellow-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              <Link 
                to="/product" 
                className="text-white hover:text-yellow-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Product
              </Link>
              <Link 
                to="/results" 
                className="text-white hover:text-yellow-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Results
              </Link>
              <Link 
                to="/pricing" 
                className="text-white hover:text-yellow-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/resources" 
                className="text-white hover:text-yellow-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                to="/about" 
                className="text-white hover:text-yellow-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-white/10 space-y-3">
                <Link 
                  to="/auth" 
                  className="block text-center text-white border border-white/30 px-4 py-3 rounded-lg font-medium hover:bg-white/10 hover:border-white/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/book-demo" 
                  className="block text-center bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
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
