import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TUser } from "../lib/schemas/auth";

export type AuthStore = {
    isAuthenticated: boolean;
    login: ({
        isAuthenticated,
        user,
    }: {
        isAuthenticated: boolean;
        user?: TUser | null;
    }) => void;
    logout: () => void;
    user?: TUser | null;
};

export const useAuth = create<AuthStore>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            login: ({ isAuthenticated, user }) =>
                set({ isAuthenticated, user }),
            logout: () => set({ isAuthenticated: false, user: null }),
            user: null,
        }),
        {
            name: "auth",
        }
    )
);
