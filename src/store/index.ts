import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState: State = {
  username: undefined,
  userId: undefined,
  gameId: undefined,
  gameCode: undefined,
};

type State = {
  username?: string;
  userId?: number;
  gameId?: number;
  gameCode?: number;
};

type Actions = {
  signIn: (username: string, userId: number) => void;
  joinGame: (gameId: number, gameCode: number) => void;
  signOut: () => void;
};

export const useAuthStore = create<State & Actions>()(
  persist(
    (set) => ({
      signIn: (username, userId) => set({ username, userId }),
      joinGame: (gameId, gameCode) => set({ gameId, gameCode }),
      signOut: () => set(initialState),
    }),
    { name: "user-storage" }
  )
);

export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback = (state: T) => state as unknown as F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};
