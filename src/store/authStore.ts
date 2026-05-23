import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isModalOpen: boolean;
  login: (name: string) => void;
  logout: () => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isModalOpen: false,
  login: (name: string) =>
    set({
      user: {
        name,
        avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${name}`,
      },
      isLoggedIn: true,
      isModalOpen: false,
    }),
  logout: () => set({ user: null, isLoggedIn: false }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
