import { create } from "zustand";

type CartStore = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export const useCart = create<CartStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));
