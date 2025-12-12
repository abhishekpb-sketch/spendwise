export type Category = string;

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO String
  isShared: boolean;
  sharedNote?: string;
  isSettled: boolean;
  createdAt: number;
}

export interface ExpenseSummary {
  total: number;
  byCategory: Record<Category, number>;
  sharedPending: number;
}

export interface UserSettings {
  reminderTime: string; // "22:00"
  enableReminders: boolean;
  currency: string;
  categories: string[];
  theme: 'light' | 'dark';
}

export const DEFAULT_CATEGORIES: Category[] = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];
