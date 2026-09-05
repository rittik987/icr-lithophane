import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.icrcustomcreations.app",
  appName: "ICR Custom Creations",
  webDir: "public",
  server: {
    url: "https://icr-lithophane.vercel.app/",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#FAF7F2",
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: "LIGHT", // Crisp dark icons/details on strong white background
      backgroundColor: "#FFFFFF", // Strong pure white status bar background
    },
  },
};

export default config;
