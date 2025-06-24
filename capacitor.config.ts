
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.985ab6cb06fa44749453a1e4efeed7d3',
  appName: 'assetguardian-dev',
  webDir: 'dist',
  server: {
    url: 'https://985ab6cb-06fa-4474-9453-a1e4efeed7d3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e40af',
      showSpinner: true,
      spinnerColor: '#ffffff'
    }
  }
};

export default config;
