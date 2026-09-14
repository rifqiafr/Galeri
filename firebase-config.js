/**
 * PixelVault — Firebase Cloud Synchronization Configuration
 * Project: pixelvault-ee740
 */

export const firebaseConfig = {
  apiKey: "AIzaSyBnhDE5HOqjZqUCygU0gMS75j1Ok_UVVw8",
  authDomain: "pixelvault-ee740.firebaseapp.com",
  projectId: "pixelvault-ee740",
  storageBucket: "pixelvault-ee740.firebasestorage.app",
  messagingSenderId: "209930938551",
  appId: "1:209930938551:web:069ae5f99f6bf638e84532",
  measurementId: "G-8C9JBBPZWM"
};

export const isFirebaseConfigured = () => {
  return (
    Boolean(firebaseConfig.apiKey) && 
    firebaseConfig.apiKey.startsWith("AIzaSy") &&
    Boolean(firebaseConfig.projectId)
  );
};
