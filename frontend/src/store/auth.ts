import type { User } from '@/types';
import { create } from 'zustand';

// Token storage key
const TOKEN_KEY = 'nassets_auth_token';
const USER_KEY = 'nassets_user';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  getToken: () => string | null;
  setLoading: (loading: boolean) => void;
  hydrateFromStorage: () => void;
}

type AuthStore = AuthState & AuthActions;

// Secure token storage utilities
const secureStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      console.error('Failed to store auth token');
    }
  },
  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      console.error('Failed to remove auth token');
    }
  },
  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: User): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      console.error('Failed to store user data');
    }
  },
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: secureStorage.getToken(),
  user: secureStorage.getUser(),
  isLoading: true,

  setAuth: (token, user) => {
    secureStorage.setToken(token);
    secureStorage.setUser(user);
    set({ token, user, isLoading: false });
  },

  setUser: (user) => {
    secureStorage.setUser(user);
    set({ user });
  },

  clearAuth: () => {
    secureStorage.removeToken();
    set({ token: null, user: null, isLoading: false });
  },

  isAuthenticated: () => {
    const { token } = get();
    if (!token) return false;
    
    // Check if token is expired by decoding JWT
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  },

  getToken: () => get().token,

  setLoading: (loading) => set({ isLoading: loading }),

  hydrateFromStorage: () => {
    const token = secureStorage.getToken();
    const user = secureStorage.getUser();
    
    if (token && user) {
      // Validate token expiration
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        
        if (Date.now() < expirationTime) {
          set({ token, user, isLoading: false });
          return;
        }
      } catch {
        // Token is invalid, clear it
      }
    }
    
    // Clear invalid/expired auth
    secureStorage.removeToken();
    set({ token: null, user: null, isLoading: false });
  },
}));

// Initialize auth state on load
if (typeof window !== 'undefined') {
  useAuthStore.getState().hydrateFromStorage();
}
