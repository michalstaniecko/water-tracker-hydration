import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type HistoryList = { date: string; amount: string }[];
type HistoryDateList = string[];

type HistoryState = {
  history: HistoryList;
};

type HistoryActions = {
  addHistory: (date: string, amount: number) => void;
  removeHistory: (date: string) => void;
  resetHistory: () => void;
  editHistory: (date: string, amount: number) => void;
  getHistoryList: () => Promise<{ date: string; amount: string }[]>;
  updateHistoryList: () => Promise<void>;
};

const initialState: HistoryState = {
  history: [],
};

const historyListKey = "historyList";

const createList = () => {
  const today = new Date().toLocaleDateString();
  return [today];
};

const updateList = (list: string[]) => {
  const today = new Date().toLocaleDateString();
  list.push(today);
  return list;
};

export const useHistoryStore = create<HistoryState & HistoryActions>((set) => ({
  ...initialState,
  updateHistoryList: async () => {
    const today = new Date().toLocaleDateString();
    try {
      let list: HistoryDateList;
      const data = await AsyncStorage.getItem(historyListKey);
      if (data === null) {
        list = createList();
        await AsyncStorage.setItem(historyListKey, JSON.stringify(list));
        return;
      }
      list = JSON.parse(data);

      if (list.includes(today)) {
        return;
      }

      list = updateList(list);
      await AsyncStorage.setItem(historyListKey, JSON.stringify(list));
    } catch (error) {
      console.error("Error fetching history data:", error);
    }
  },
  getHistoryList: async () => {
    try {
      const data = await AsyncStorage.getItem(historyListKey);
      if (data === null) {
        return [];
      }
      const listOfDates = JSON.parse(data);
      const listOfValues = await Promise.all(
        listOfDates.map((date: string) => AsyncStorage.getItem(date)),
      );
      return listOfDates.map((date: string, index: number) => ({
        date,
        amount: listOfValues[index],
      }));
    } catch (e) {
      console.error("Error fetching history data:", e);
    }
  },
  addHistory: async (amount) => {
    const date = new Date().toLocaleDateString();
    try {
      await AsyncStorage.setItem(date, amount);
    } catch (error) {
      console.error("Error adding history data:", error);
    }
  },
  getHistory: async () => {},
  editHistory: (date, amount) => {},
  removeHistory: (date) => {},
  resetHistory: () => set(initialState),
}));
