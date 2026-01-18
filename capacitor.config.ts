import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.maxnutrition.app',
  appName: 'MaxNutrition',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#10b981',
      showSpinner: true,
      spinnerColor: '#ffffff',
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#10b981',
    },
    Keyboard: {
      resize: 'ionic',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Camera: {
      permissions: {
        camera: 'This app needs camera access to analyze food and exercises',
        photos: 'This app needs photo access to save analysis results',
      },
    },
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#10b981',
  },
  android: {
    backgroundColor: '#10b981',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;