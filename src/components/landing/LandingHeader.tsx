
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
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm transition-all duration-200 ${isScrolled ? 'shadow-sm border-b border-gray-100' : ''}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Lockup - Far Left */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
              alt="AssetGuardian.ai Logo - Predictive Maintenance Platform" 
              className="h-8 w-8" 
            />
            <h1 className="text-xl font-bold text-primary">AssetGuardian.ai</h1>
          </div>

          {/* Navigation Links - Center Right */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/landing" className="text-gray-800 hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/solutions" className="text-gray-800 hover:text-primary transition-colors font-medium">
              Solutions
            </Link>
            <Link to="/product" className="text-gray-800 hover:text-primary transition-colors font-medium">
              Product
            </Link>
            <Link to="/results" className="text-gray-800 hover:text-primary transition-colors font-medium">
              Results
            </Link>
            <Link to="/pricing" className="text-gray-800 hover:text-primary transition-colors font-medium">
              Pricing
            </Link>
            <Link to="/resources" className="text-gray-800 hover:text-primary transition-colors font-medium">
              Resources
            </Link>
            <Link to="/about" className="text-gray-800 hover:text-primary transition-colors font-medium">
              About
            </Link>
          </div>

          {/* Sign In Button - Far Right */}
          <div className="hidden md:flex">
            <Link 
              to="/auth" 
              className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-300 transition-colors"
            >
              Sign In
            </Link>
          </div>
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
                className="text-gray-800 hover:text-primary transition-colors py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/solutions" 
                className="text-gray-800 hover:text-primary transition-colors py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              <Link 
                to="/product" 
                className="text-gray-800 hover:text-primary transition-colors py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Product
              </Link>
              <Link 
                to="/results" 
                className="text-gray-800 hover:text-primary transition-colors py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Results
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-800 hover:text-primary transition-colors py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/resources" 
                className="text-gray-800 hover:text-primary transition-colors py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                to="/about" 
                className="text-gray-800 hover:text-primary transition-colors py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <Link 
                  to="/auth" 
                  className="block text-center bg-gray-50 text-gray-700 border border-gray-200 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
