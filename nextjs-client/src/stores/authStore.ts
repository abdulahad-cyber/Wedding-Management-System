// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  user_id: string;
  username: string;
  email: string;
  is_admin: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "auth_store" }
  )
);
