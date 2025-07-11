import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuditService } from '@/services/auditService';
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

export const useAuditTracker = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const sessionStartTime = useRef<number>(Date.now());
  const sessionId = useRef<string | null>(null);
  const lastRoute = useRef<string>('');
  const pageLoadStart = useRef<number>(Date.now());

  // Track session start and initialize user metrics
  useEffect(() => {
    if (isAuthenticated && user) {
      const initializeSession = async () => {
        try {
          // Start user metrics session first
          const userMetricsSessionId = await UserMetricsService.startSession();
          
          if (userMetricsSessionId) {
            sessionId.current = userMetricsSessionId;
            
            // Use the same session ID for audit service
            AuditService.logSessionStart(userMetricsSessionId);
            sessionStartTime.current = Date.now();
            
            console.log('Session initialized:', userMetricsSessionId);
          } else {
            // Fallback to local session ID if user metrics fails
            const fallbackId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionId.current = fallbackId;
            AuditService.logSessionStart(fallbackId);
            sessionStartTime.current = Date.now();
            
            console.warn('Using fallback session ID');
          }
        } catch (error) {
          console.error('Failed to initialize session:', error);
          // Fallback session handling
          const fallbackId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionId.current = fallbackId;
          AuditService.logSessionStart(fallbackId);
          sessionStartTime.current = Date.now();
        }
      };

      initializeSession();
    }
  }, [isAuthenticated, user]);

  // Track navigation/feature access and page views
  useEffect(() => {
    if (isAuthenticated && user && location.pathname !== lastRoute.current) {
      const featureName = getFeatureName(location.pathname);
      
      // Log page load time if this is a route change (not initial load)
      if (lastRoute.current) {
        const loadTime = Date.now() - pageLoadStart.current;
        UserMetricsService.logPageLoadTime(location.pathname, loadTime);
      }
      
      // Log to both audit service and user metrics service
      AuditService.logFeatureAccess(featureName, location.pathname, {
        previousRoute: lastRoute.current,
        sessionId: sessionId.current
      });
      
      UserMetricsService.logFeatureAccess(featureName, location.pathname, {
        previousRoute: lastRoute.current,
        sessionId: sessionId.current
      });
      
      // Log page view
      UserMetricsService.logPageView(location.pathname, featureName);
      
      lastRoute.current = location.pathname;
      pageLoadStart.current = Date.now(); // Reset for next page
    }
  }, [location.pathname, isAuthenticated, user]);

  // Track session end on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated && user && sessionId.current) {
        const duration = Date.now() - sessionStartTime.current;
        
        // End both audit and user metrics sessions
        AuditService.logSessionEnd(sessionId.current, duration);
        UserMetricsService.endSession();
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

  const logCustomAction = (action: string, tableName: string, metadata?: Record<string, any>) => {
    if (isAuthenticated && user) {
      return AuditService.logEvent({
        action,
        tableName,
        metadata: {
          sessionId: sessionId.current,
          ...metadata
        }
      });
    }
  };

  return {
    sessionId: sessionId.current,
    logCustomAction
  };
};