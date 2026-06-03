import { create } from "zustand";
import type { User } from "../types/auth.types";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    setUser: (user: User) => void;
    setLoading: (val: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({

    user: null,
    isAuthenticated: false,
    loading: false,

    setUser: (user) => { console.log(" SETTING USER (FULL DATA):", user); set({ user, isAuthenticated: true, loading: false }) },

    setLoading: (val: boolean) => set({ loading: val }),
    logout: () => set({ user: null, isAuthenticated: false, loading: false }),
}))



