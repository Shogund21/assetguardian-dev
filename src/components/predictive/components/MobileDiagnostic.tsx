
import React, { useEffect, useState } from 'react';

export const MobileDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});

  useEffect(() => {
    const checkMobileConstraints = () => {
      // Check viewport
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        orientation: window.screen?.orientation?.type || 'unknown'
      };

      // Check parent containers
      const tabsElement = document.querySelector('[data-state="active"]');
      const mainElement = document.querySelector('main');
      const layoutElement = document.querySelector('.min-h-screen');

      const containerStyles = {
        tabs: tabsElement ? {
          overflow: getComputedStyle(tabsElement).overflow,
          height: getComputedStyle(tabsElement).height,
          maxHeight: getComputedStyle(tabsElement).maxHeight,
          position: getComputedStyle(tabsElement).position,
          zIndex: getComputedStyle(tabsElement).zIndex
        } : null,
        main: mainElement ? {
          overflow: getComputedStyle(mainElement).overflow,
          height: getComputedStyle(mainElement).height,
          maxHeight: getComputedStyle(mainElement).maxHeight,
          position: getComputedStyle(mainElement).position,
        } : null,
        layout: layoutElement ? {
          overflow: getComputedStyle(layoutElement).overflow,
          height: getComputedStyle(layoutElement).height,
          maxHeight: getComputedStyle(layoutElement).maxHeight,
          position: getComputedStyle(layoutElement).position,
        } : null
      };

      setDiagnostics({
        viewport,
        containerStyles,
        timestamp: new Date().toISOString()
      });
    };

    checkMobileConstraints();
    
    // Re-check on resize
    window.addEventListener('resize', checkMobileConstraints);
    return () => window.removeEventListener('resize', checkMobileConstraints);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-200 border-b-4 border-yellow-600 p-2 z-[9998] text-xs">
      <div className="font-bold text-yellow-800 mb-1">📱 Mobile Diagnostic</div>
      <div className="grid grid-cols-2 gap-2 text-yellow-700">
        <div>
          Viewport: {diagnostics.viewport?.width}x{diagnostics.viewport?.height}
        </div>
        <div>
          DPR: {diagnostics.viewport?.devicePixelRatio}
        </div>
        <div>
          Tabs overflow: {diagnostics.containerStyles?.tabs?.overflow || 'N/A'}
        </div>
        <div>
          Main height: {diagnostics.containerStyles?.main?.height || 'N/A'}
        </div>
      </div>
    </div>
  );
};
