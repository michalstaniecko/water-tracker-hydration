import { create } from "zustand";

type HistoryState = {
  history: { date: string; amount: number }[];
};

type HistoryActions = {
  addHistory: (date: string, amount: number) => void;
  removeHistory: (date: string) => void;
  resetHistory: () => void;
};

const initialState: HistoryState = {
  history: [],
};

export const useHistoryStore = create<HistoryState & HistoryActions>((set) => ({
  ...initialState,
  addHistory: (date, amount) =>
    set((state) => ({
      history: [...state.history, { date, amount }],
    })),
  removeHistory: (date) =>
    set((state) => ({
      history: state.history.filter((item) => item.date !== date),
    })),
  resetHistory: () => set(initialState),
}));
