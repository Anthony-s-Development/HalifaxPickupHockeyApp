import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.halifaxpickuphockeyhfx.app',
  appName: 'Halifax Pickup Hockey',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#999999"
    },
  },
};

export default config;
