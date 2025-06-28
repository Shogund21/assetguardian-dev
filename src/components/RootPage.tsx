
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";

const RootPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <img 
            src="/lovable-uploads/4dfe5c17-1999-42ee-95ba-9c21b23df30a.png" 
            alt="Asset Guardian Logo" 
            className="h-16 w-16 mx-auto mb-6 animate-pulse" 
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Asset Guardian...</p>
        </div>
      </div>
    );
  }

  // Show Landing page for non-authenticated users, Dashboard for authenticated users
  return isAuthenticated ? <Index /> : <Landing />;
};

export default RootPage;
