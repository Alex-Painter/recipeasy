import { create } from "zustand";

type BalanceStore = {
  balance: number | null;
  setBalance: (newBalance: number | null) => void;
};

const useBalanceStore = create<BalanceStore>((set) => ({
  balance: null,
  setBalance: (newBalance: number | null) =>
    set(() => ({ balance: newBalance })),
}));

type HistoryStore = {
  previousPathname: string | null;
  setPreviousPathname: (newPathname: string | null) => void;
};

const useHistoryStore = create<HistoryStore>((set) => ({
  previousPathname: null,
  setPreviousPathname: (newPathname: string | null) =>
    set(() => {
      console.log("");
      return {
        previousPathname: newPathname,
      };
    }),
}));

export { useBalanceStore, useHistoryStore };
