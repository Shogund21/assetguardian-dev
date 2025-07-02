import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuditService } from '@/services/auditService';
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
  const sessionId = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const lastRoute = useRef<string>('');

  // Track session start
  useEffect(() => {
    if (isAuthenticated && user) {
      AuditService.logSessionStart(sessionId.current);
      sessionStartTime.current = Date.now();
    }
  }, [isAuthenticated, user]);

  // Track navigation/feature access
  useEffect(() => {
    if (isAuthenticated && user && location.pathname !== lastRoute.current) {
      const featureName = getFeatureName(location.pathname);
      
      AuditService.logFeatureAccess(featureName, location.pathname, {
        previousRoute: lastRoute.current,
        sessionId: sessionId.current
      });
      
      lastRoute.current = location.pathname;
    }
  }, [location.pathname, isAuthenticated, user]);

  // Track session end on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated && user) {
        const duration = Date.now() - sessionStartTime.current;
        AuditService.logSessionEnd(sessionId.current, duration);
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