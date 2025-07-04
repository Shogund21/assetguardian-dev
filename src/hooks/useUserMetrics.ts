import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { UserMetricsService } from '@/services/userMetricsService';
import { useAuth } from '@/hooks/useAuth';

interface FeatureMap {
  [key: string]: string;
}

const FEATURE_MAP: FeatureMap = {
  '/': 'Dashboard',
  '/equipment': 'Equipment Management',
  '/equipment/': 'Equipment Details',
  '/add-equipment': 'Add Equipment',
  '/projects': 'Project Management',
  '/maintenance-checks': 'Maintenance Checks',
  '/predictive-maintenance': 'Predictive Maintenance',
  '/analytics': 'Analytics Dashboard',
  '/settings': 'System Settings',
  '/customer-manual': 'Documentation'
};

export const useUserMetrics = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const pageLoadStart = useRef<number>(Date.now());
  const lastRoute = useRef<string>('');
  const sessionStarted = useRef<boolean>(false);

  // Start session when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !sessionStarted.current) {
      UserMetricsService.startSession();
      sessionStarted.current = true;
    }
  }, [isAuthenticated, user]);

  // Track page views and measure page load times
  useEffect(() => {
    if (isAuthenticated && user) {
      const currentRoute = location.pathname;
      
      // Log page load time if this is a route change
      if (lastRoute.current && lastRoute.current !== currentRoute) {
        const loadTime = Date.now() - pageLoadStart.current;
        UserMetricsService.logPageLoadTime(currentRoute, loadTime);
      }
      
      // Log page view
      const featureName = getFeatureName(currentRoute);
      UserMetricsService.logPageView(currentRoute, featureName);
      
      lastRoute.current = currentRoute;
      pageLoadStart.current = Date.now();
    }
  }, [location.pathname, isAuthenticated, user]);

  // End session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated && user && sessionStarted.current) {
        UserMetricsService.endSession();
        sessionStarted.current = false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated, user]);

  const getFeatureName = (pathname: string): string => {
    // Check for exact matches first
    if (FEATURE_MAP[pathname]) {
      return FEATURE_MAP[pathname];
    }
    
    // Check for partial matches (like equipment details)
    for (const route in FEATURE_MAP) {
      if (route.endsWith('/') && pathname.startsWith(route)) {
        return FEATURE_MAP[route];
      }
    }
    
    return `Unknown Feature (${pathname})`;
  };

  const trackButtonClick = (componentName: string, details?: Record<string, any>) => {
    if (isAuthenticated && user) {
      UserMetricsService.logButtonClick(componentName, {
        route: location.pathname,
        ...details
      });
    }
  };

  const trackFormSubmit = (formName: string, details?: Record<string, any>) => {
    if (isAuthenticated && user) {
      UserMetricsService.logFormSubmit(formName, {
        route: location.pathname,
        ...details
      });
    }
  };

  const trackFeatureAccess = (featureName: string, details?: Record<string, any>) => {
    if (isAuthenticated && user) {
      UserMetricsService.logFeatureAccess(featureName, location.pathname, details);
    }
  };

  const trackApiCall = (endpoint: string, responseTime: number, success: boolean, error?: string) => {
    if (isAuthenticated && user) {
      UserMetricsService.logApiResponse(endpoint, responseTime, !success, error);
    }
  };

  return {
    trackButtonClick,
    trackFormSubmit,
    trackFeatureAccess,
    trackApiCall,
    getFeatureName
  };
};