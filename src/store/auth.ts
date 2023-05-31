import { create } from "zustand";
import { combine } from "zustand/middleware";

export const useAuthState = create(
  combine({} as { userId?: string }, (set) => ({
    signIn: (newId: string) => set((_state) => ({ userId: newId })),
  }))
);
