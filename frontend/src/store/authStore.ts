import { create } from 'zustand';
import type { User } from '@/types/common';

const TOKEN_KEY = 'auth_token';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),

  setAuth: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    useAuthStore.setState({ user, token });
  },

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    useAuthStore.setState({ token });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    useAuthStore.setState({ user: null, token: null });
  },
}));