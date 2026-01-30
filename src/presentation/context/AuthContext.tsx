'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserRole, toUserRole } from '@/domain/entities/UserRole';
import { useDI } from '@/presentation/context/DIContext';

interface AuthContextType {
  isAuthenticated: boolean;
  uid: string | null; // Add `uid` property
  user: { uid: string; name: string } | null;
  role: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  uid: null, 
  user: null,
  role: null, // Set default to null
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uid, setUid] = useState<string | null>(null); // Add state for `uid`
  const [user, setUser] = useState<{ uid: string; name: string } | null>(null);
  const [role, setRole] = useState<UserRole | null>(null); // Fix type here
  const [loading, setLoading] = useState(true);
  const { observeAuthStateUseCase } = useDI();

  useEffect(() => {
    const readCachedRole = (): UserRole | null => {
      if (typeof window === 'undefined') return null;
      try {
        const stored = localStorage.getItem('userRole');
        const parsed = toUserRole(stored);
        if (parsed) return parsed;
      } catch {}
      const match = document.cookie.match(/(?:^|; )userRole=([^;]+)/);
      if (match) {
        const value = decodeURIComponent(match[1]);
        const parsed = toUserRole(value);
        if (parsed) return parsed;
      }
      return null;
    };

    const unsubscribe = observeAuthStateUseCase.subscribe(async (state) => {
      if (state.isAuthenticated && state.user) {
        setIsAuthenticated(true);
        setUid(state.user.uid);
        const cachedRole = readCachedRole();
        const resolvedRole = state.profile?.role ?? cachedRole ?? UserRole.Patient;
        const resolvedName = state.profile?.name ?? 'Unknown';
        setRole(resolvedRole);
        setUser({ uid: state.user.uid, name: resolvedName });
        try {
          localStorage.setItem('userRole', resolvedRole);
        } catch {}
      } else {
        setIsAuthenticated(false);
        setUid(null);
        setUser(null);
        setRole(null);
        try {
          localStorage.removeItem('userRole');
        } catch {}
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [observeAuthStateUseCase]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, uid, user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
