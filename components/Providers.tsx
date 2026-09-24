'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logOut, fetchUserFavorites, toggleFavoriteTool, testFirebaseConnection } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  favorites: string[];
  toggleFavorite: (toolId: string) => Promise<void>;
  isDark: boolean;
  toggleTheme: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(['merge-pdf', 'compress-pdf', 'sign-pdf']);
  const [isDark, setIsDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTheme = localStorage.getItem('zorapdf_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
      setIsDark(shouldDark);
      if (shouldDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Load guest favorites if any
      const savedFavs = localStorage.getItem('zorapdf_favs');
      if (savedFavs) {
        try {
          setFavorites(JSON.parse(savedFavs));
        } catch {
          // ignore
        }
      }
    }, 0);

    // Validate firebase connection as specified in firebase-skill
    testFirebaseConnection();

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('zorapdf_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('zorapdf_theme', 'light');
      }
      return next;
    });
  };

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const userFavs = await fetchUserFavorites();
          if (userFavs && userFavs.length > 0) {
            setFavorites(userFavs);
          }
        } catch (e) {
          console.warn('Could not sync user favorites:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setUser(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const handleToggleFavorite = async (toolId: string) => {
    const exists = favorites.includes(toolId);
    const updated = exists ? favorites.filter((id) => id !== toolId) : [...favorites, toolId];
    setFavorites(updated);
    localStorage.setItem('zorapdf_favs', JSON.stringify(updated));

    if (user) {
      try {
        await toggleFavoriteTool(toolId, !exists);
      } catch (err) {
        console.warn('Failed to sync favorite to firestore:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        favorites,
        toggleFavorite: handleToggleFavorite,
        isDark,
        toggleTheme,
        searchOpen,
        setSearchOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useApp must be used within a Providers tree');
  }
  return context;
}
