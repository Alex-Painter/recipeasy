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
  setPreviousPathname: (newPathname: string) => void;
};

const useHistoryStore = create<HistoryStore>((set) => ({
  previousPathname: null,
  setPreviousPathname: (newPathname: string) =>
    set(() => ({
      previousPathname: newPathname,
    })),
}));

export { useBalanceStore, useHistoryStore };
