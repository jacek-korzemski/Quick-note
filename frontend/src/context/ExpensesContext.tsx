import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  expensesApi,
  type ExpenseCategory,
  type ExpenseSummary,
} from '@/api/expenses';
import { useAuth } from '@/context/AuthContext';

interface ExpensesContextType {
  currentMonth: string;
  categories: ExpenseCategory[];
  summary: ExpenseSummary;
  loading: boolean;
  error: string | null;
  setMonth: (month: string) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  refreshMonth: () => Promise<void>;
  createCategory: (input: { name: string; color: string }) => Promise<void>;
  updateCategory: (id: number, data: { name?: string; color?: string }) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  reorderCategories: (categoryIds: number[]) => Promise<void>;
  createItem: (input: {
    category_id: number;
    name: string;
    description?: string;
    day: number;
    amount: number;
  }) => Promise<void>;
  updateItem: (
    id: number,
    data: { name?: string; description?: string; day?: number; amount?: number }
  ) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType | null>(null);

function formatMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return formatMonth(d);
}

const emptySummary: ExpenseSummary = {
  total_items: 0,
  total_amount: 0,
  by_color: {
    info: { count: 0, amount: 0 },
    warning: { count: 0, amount: 0 },
    error: { count: 0, amount: 0 },
    success: { count: 0, amount: 0 },
    none: { count: 0, amount: 0 },
  },
};

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => formatMonth(new Date()));
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>(emptySummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMonth = useCallback(
    async (month: string) => {
      if (!user) {
        setCategories([]);
        setSummary(emptySummary);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await expensesApi.getMonth(month);
        setCategories(data.categories);
        setSummary(data.summary);
      } catch (e) {
        setCategories([]);
        setSummary(emptySummary);
        setError(e instanceof Error ? e.message : 'Nie udało się pobrać wydatków.');
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) {
      loadMonth(currentMonth);
    } else {
      setCategories([]);
      setSummary(emptySummary);
    }
  }, [user, currentMonth, loadMonth]);

  const setMonth = useCallback((month: string) => {
    setCurrentMonth(month);
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((prev) => shiftMonth(prev, -1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => shiftMonth(prev, 1));
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setCurrentMonth(formatMonth(new Date()));
  }, []);

  const refreshMonth = useCallback(async () => {
    await loadMonth(currentMonth);
  }, [loadMonth, currentMonth]);

  const createCategory = useCallback(
    async (input: { name: string; color: string }) => {
      await expensesApi.createCategory({
        name: input.name,
        color: input.color,
        created_month: currentMonth,
      });
      await loadMonth(currentMonth);
    },
    [currentMonth, loadMonth]
  );

  const updateCategory = useCallback(
    async (id: number, data: { name?: string; color?: string }) => {
      await expensesApi.updateCategory(id, data);
      await loadMonth(currentMonth);
    },
    [currentMonth, loadMonth]
  );

  const deleteCategory = useCallback(
    async (id: number) => {
      await expensesApi.deleteCategory(id, currentMonth);
      await loadMonth(currentMonth);
    },
    [currentMonth, loadMonth]
  );

  const reorderCategories = useCallback(
    async (categoryIds: number[]) => {
      await expensesApi.reorderCategories(categoryIds);
      await loadMonth(currentMonth);
    },
    [currentMonth, loadMonth]
  );

  const createItem = useCallback(
    async (input: {
      category_id: number;
      name: string;
      description?: string;
      day: number;
      amount: number;
    }) => {
      await expensesApi.createItem({
        ...input,
        month: currentMonth,
      });
      await loadMonth(currentMonth);
    },
    [currentMonth, loadMonth]
  );

  const updateItem = useCallback(
    async (
      id: number,
      data: { name?: string; description?: string; day?: number; amount?: number }
    ) => {
      await expensesApi.updateItem(id, data);
      await loadMonth(currentMonth);
    },
    [currentMonth, loadMonth]
  );

  const deleteItem = useCallback(
    async (id: number) => {
      await expensesApi.deleteItem(id);
      await loadMonth(currentMonth);
    },
    [currentMonth, loadMonth]
  );

  const value = useMemo<ExpensesContextType>(
    () => ({
      currentMonth,
      categories,
      summary,
      loading,
      error,
      setMonth,
      goToPrevMonth,
      goToNextMonth,
      goToCurrentMonth,
      refreshMonth,
      createCategory,
      updateCategory,
      deleteCategory,
      reorderCategories,
      createItem,
      updateItem,
      deleteItem,
    }),
    [
      currentMonth, categories, summary, loading, error,
      setMonth, goToPrevMonth, goToNextMonth, goToCurrentMonth,
      refreshMonth, createCategory, updateCategory, deleteCategory, reorderCategories,
      createItem, updateItem, deleteItem,
    ]
  );

  return (
    <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  return ctx;
}
