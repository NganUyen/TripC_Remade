
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
    }
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
