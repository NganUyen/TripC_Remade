
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tripc.app',
  appName: 'TripC Pro',
  webDir: 'public',
  server: {
    url: 'https://trip-c-remade.vercel.app', // Using Vercel as Live Wrapper
    cleartext: true,
    allowNavigation: [
      '*'
    ]
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#ffffffff'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  android: {
    allowMixedContent: true,
    overrideUserAgent: "Mozilla/5.0 (Linux; Android 14; Mobile; rv:109.0) Gecko/113.0 Firefox/113.0" // Spoof as Firefox/Chrome to allow Google Auth
  }
};

export default config;
