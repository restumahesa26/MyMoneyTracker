"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateUserProfileData: (displayName: string, photoURL?: string | null) => Promise<void>;
}

const DEMO_USER: UserProfile = {
  uid: "demo_guest_user_2026",
  email: "demo.user@moneytracker.id",
  displayName: "Guest Demo User",
  photoURL: null,
  currency: "IDR",
  isDemo: true,
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemo: false,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  loginAsGuest: () => {},
  logout: async () => {},
  updateUserProfileData: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  useEffect(() => {
    // Check if guest demo session is saved in localStorage
    const savedDemo = localStorage.getItem("mmt_demo_user");
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setUser(parsed);
        setIsDemo(true);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("mmt_demo_user");
      }
    }

    if (!isFirebaseConfigured() || !auth) {
      // If Firebase is not configured and no user yet, default to guest session so user can immediately test!
      setUser(DEMO_USER);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          photoURL: fbUser.photoURL,
          currency: "IDR",
          isDemo: false,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
        });
        setIsDemo(false);
      } else {
        // If logged out from Firebase and not in demo mode
        const demoMode = localStorage.getItem("mmt_demo_user");
        if (demoMode) {
          setUser(JSON.parse(demoMode));
          setIsDemo(true);
        } else {
          setUser(null);
          setIsDemo(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured() || !auth) {
      loginAsGuest();
      return;
    }
    setLoading(true);
    try {
      localStorage.removeItem("mmt_demo_user");
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured() || !auth) {
      loginAsGuest();
      return;
    }
    setLoading(true);
    try {
      localStorage.removeItem("mmt_demo_user");
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      console.error("Email login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (!isFirebaseConfigured() || !auth) {
      loginAsGuest();
      return;
    }
    setLoading(true);
    try {
      localStorage.removeItem("mmt_demo_user");
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name,
          photoURL: null,
          currency: "IDR",
          isDemo: false,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = () => {
    localStorage.setItem("mmt_demo_user", JSON.stringify(DEMO_USER));
    setUser(DEMO_USER);
    setIsDemo(true);
    setLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem("mmt_demo_user");
    if (auth && isFirebaseConfigured()) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setIsDemo(false);
  };

  const updateUserProfileData = async (displayName: string, photoURL?: string | null) => {
    if (auth?.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: displayName || undefined,
        photoURL: photoURL ?? undefined,
      });
    }
    setUser((prev) =>
      prev
        ? {
            ...prev,
            displayName,
            photoURL: photoURL ?? null,
          }
        : null
    );
    if (isDemo && typeof window !== "undefined") {
      const demoData = {
        ...DEMO_USER,
        displayName,
        photoURL: photoURL ?? null,
      };
      localStorage.setItem("mmt_demo_user", JSON.stringify(demoData));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemo,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsGuest,
        logout,
        updateUserProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
