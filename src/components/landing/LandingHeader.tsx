
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export const LandingHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm transition-all duration-200 ${isScrolled ? 'shadow-sm border-b border-gray-100' : ''}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Lockup - Far Left */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <img 
              src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
              alt="AssetGuardian.ai Logo - Predictive Maintenance Platform" 
              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0" 
            />
            <h1 className="text-lg sm:text-xl font-bold text-primary truncate">AssetGuardian.ai</h1>
          </div>

          {/* Navigation Links - Center Right */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {location.pathname !== '/landing' && (
              <Link to="/landing" className="text-gray-800 hover:text-primary transition-colors font-medium text-sm xl:text-base">
                Home
              </Link>
            )}
            <Link to="/solutions" className="text-gray-800 hover:text-primary transition-colors font-medium text-sm xl:text-base">
              Solutions
            </Link>
            <Link to="/product" className="text-gray-800 hover:text-primary transition-colors font-medium text-sm xl:text-base">
              Product
            </Link>
            <Link to="/results" className="text-gray-800 hover:text-primary transition-colors font-medium text-sm xl:text-base">
              Results
            </Link>
            <Link to="/pricing" className="text-gray-800 hover:text-primary transition-colors font-medium text-sm xl:text-base">
              Pricing
            </Link>
            <Link to="/resources" className="text-gray-800 hover:text-primary transition-colors font-medium text-sm xl:text-base">
              Resources
            </Link>
            <Link to="/about" className="text-gray-800 hover:text-primary transition-colors font-medium text-sm xl:text-base">
              About
            </Link>
          </div>

          {/* Sign In Button - Far Right */}
          <div className="hidden lg:flex">
            <Link 
              to="/auth" 
              className="bg-gray-50 text-gray-700 border border-gray-200 px-3 py-2 xl:px-4 xl:py-2 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-300 transition-colors text-sm xl:text-base"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden text-gray-800 p-3 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-sm border-t border-gray-200 z-50 shadow-lg">
            <div className="flex flex-col space-y-1 p-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {location.pathname !== '/landing' && (
                <Link 
                  to="/landing" 
                  className="text-gray-800 hover:text-primary hover:bg-gray-50 transition-colors py-3 px-4 rounded-lg font-medium text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
              )}
              <Link
                to="/solutions" 
                className="text-gray-800 hover:text-primary hover:bg-gray-50 transition-colors py-3 px-4 rounded-lg font-medium text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              <Link 
                to="/product" 
                className="text-gray-800 hover:text-primary hover:bg-gray-50 transition-colors py-3 px-4 rounded-lg font-medium text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Product
              </Link>
              <Link 
                to="/results" 
                className="text-gray-800 hover:text-primary hover:bg-gray-50 transition-colors py-3 px-4 rounded-lg font-medium text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Results
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-800 hover:text-primary hover:bg-gray-50 transition-colors py-3 px-4 rounded-lg font-medium text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/resources" 
                className="text-gray-800 hover:text-primary hover:bg-gray-50 transition-colors py-3 px-4 rounded-lg font-medium text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                to="/about" 
                className="text-gray-800 hover:text-primary hover:bg-gray-50 transition-colors py-3 px-4 rounded-lg font-medium text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-3 mt-2 border-t border-gray-200">
                <Link 
                  to="/auth" 
                  className="block text-center bg-gray-50 text-gray-700 border border-gray-200 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-300 transition-colors text-base min-h-[48px] flex items-center justify-center"
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
