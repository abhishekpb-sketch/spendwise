import { Expense, UserSettings, DEFAULT_CATEGORIES } from '../types';

const EXPENSE_KEY = 'spendwise_expenses';
const SETTINGS_KEY = 'spendwise_settings';

const DEFAULT_SETTINGS: UserSettings = {
  reminderTime: '22:00',
  enableReminders: true,
  currency: '$',
  categories: DEFAULT_CATEGORIES,
  theme: 'light',
};

export const StorageService = {
  getExpenses: (): Expense[] => {
    try {
      const stored = localStorage.getItem(EXPENSE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load expenses', e);
      return [];
    }
  },

  saveExpenses: (expenses: Expense[]) => {
    try {
      localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses', e);
    }
  },

  getSettings: (): UserSettings => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      // Merge with default settings to ensure new fields (like categories/theme) exist for old users
      const parsed = stored ? JSON.parse(stored) : {};
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: UserSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },
};
