import { create } from "zustand";

type BalanceStore = {
  balance: number | null;
  setBalance: (newBalance: number) => void;
};

const useBalanceStore = create<BalanceStore>((set) => ({
  balance: null,
  setBalance: (newBalance: number) => set(() => ({ balance: newBalance })),
}));

export { useBalanceStore };
