import { Expense, UserSettings, DEFAULT_CATEGORIES } from '../types';
import { Redis } from '@upstash/redis';

const EXPENSE_KEY = 'spendwise_expenses';
const SETTINGS_KEY = 'spendwise_settings';

const DEFAULT_SETTINGS: UserSettings = {
  reminderTime: '22:00',
  enableReminders: true,
  currency: '$',
  categories: DEFAULT_CATEGORIES,
  theme: 'light',
};

// Initialize Redis only if keys are present
const redis = (import.meta.env.VITE_UPSTASH_REDIS_REST_URL && import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
    url: import.meta.env.VITE_UPSTASH_REDIS_REST_URL,
    token: import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN,
  })
  : null;

export const StorageService = {
  getExpenses: async (): Promise<Expense[]> => {
    try {
      if (redis) {
        const stored = await redis.get<Expense[]>(EXPENSE_KEY);
        return stored || [];
      }
      // Fallback to localStorage
      const stored = localStorage.getItem(EXPENSE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load expenses', e);
      return [];
    }
  },

  saveExpenses: async (expenses: Expense[]) => {
    try {
      if (redis) {
        await redis.set(EXPENSE_KEY, expenses);
      }
      // Keep localStorage in sync or as backup
      localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses', e);
    }
  },

  getSettings: async (): Promise<UserSettings> => {
    try {
      let stored: UserSettings | null = null;

      if (redis) {
        stored = await redis.get<UserSettings>(SETTINGS_KEY);
      } else {
        const local = localStorage.getItem(SETTINGS_KEY);
        stored = local ? JSON.parse(local) : null;
      }

      // Merge with default settings
      return { ...DEFAULT_SETTINGS, ...stored };
    } catch (e) {
      console.error('Failed to get settings', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: async (settings: UserSettings) => {
    try {
      if (redis) {
        await redis.set(SETTINGS_KEY, settings);
      }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },
};
