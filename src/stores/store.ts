import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

type User = Record<string, any>;

interface Token {
  access_token?: string;
  refresh_token?: string;
}

// Define the state interface (only the data we want to persist)
interface AuthStateData {
  user: User | null;
  token: Token | null;
}

// Define the full state interface including methods
interface AuthState extends AuthStateData {
  setUser: (user: User) => void;
  setToken: (token: Token) => void;
  logout: () => void;
}

type AuthStorePersist = PersistOptions<AuthState, AuthStateData>;

// Use browser localStorage for persistence
const persistConfig: AuthStorePersist = {
  name: 'crwd-storage',
  storage: {
    getItem: async (name) => {
      const value = localStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    },
    setItem: async (name, value) => {
      localStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: async (name) => {
      localStorage.removeItem(name);
    },
  },
  partialize: (state) => ({
    user: state.user,
    token: state.token,
  }),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    persistConfig
  )
);
