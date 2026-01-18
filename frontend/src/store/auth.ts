import type { User } from '@/types';
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: User | null;
}

interface AuthActions {
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,

  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  isAuthenticated: () => !!get().token,
}));
