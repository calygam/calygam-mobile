import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBMGn95ySNiVqUfs-RvvsN8bxR0oT1cH2U",
    authDomain: "calygam-63613.firebaseapp.com",
    projectId: "calygam-63613",
    storageBucket: "calygam-63613.appspot.com",
    messagingSenderId: "996401956233",
    appId: "1:996401956233:android:927bbda363116e5e380d58",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

let auth;
if (!app._authInitialized) {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
    app._authInitialized = true; // marque como inicializado
} else {
    auth = getAuth(app);
}

export { auth };