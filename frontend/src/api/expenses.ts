import { API_BASE_URL } from '@/config';

const API_BASE = `${API_BASE_URL}/api/expenses`;

export interface ExpenseItem {
  id: number;
  category_id: number;
  user_id: number;
  name: string;
  description: string;
  day: number;
  month: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  color: 'info' | 'warning' | 'error' | 'success' | 'none';
  created_month: string;
  items: ExpenseItem[];
  items_count: number;
  items_total: number;
}

export interface ColorSummary {
  count: number;
  amount: number;
}

export interface ExpenseSummary {
  total_items: number;
  total_amount: number;
  by_color: Record<string, ColorSummary>;
}

export interface MonthData {
  categories: ExpenseCategory[];
  summary: ExpenseSummary;
}

interface ApiError {
  error: string;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as ApiError).error || 'Wystąpił błąd serwera.');
  }

  return data as T;
}

export const expensesApi = {
  getMonth(month: string) {
    const params = new URLSearchParams({ month });
    return request<MonthData>(`/month?${params}`);
  },

  createCategory(data: { name: string; color: string; created_month: string }) {
    return request<{ category: ExpenseCategory }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory(id: number, data: { name?: string; color?: string }) {
    return request<{ category: ExpenseCategory }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  reorderCategories(categoryIds: number[]) {
    return request<{ message: string }>('/categories/reorder', {
      method: 'PUT',
      body: JSON.stringify({ category_ids: categoryIds }),
    });
  },

  deleteCategory(id: number, month: string) {
    const params = new URLSearchParams({ month });
    return request<{ message: string }>(`/categories/${id}?${params}`, {
      method: 'DELETE',
    });
  },

  createItem(data: {
    category_id: number;
    name: string;
    description?: string;
    day: number;
    month: string;
    amount: number;
  }) {
    return request<{ item: ExpenseItem }>('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateItem(
    id: number,
    data: { name?: string; description?: string; day?: number; amount?: number }
  ) {
    return request<{ item: ExpenseItem }>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteItem(id: number) {
    return request<{ message: string }>(`/items/${id}`, {
      method: 'DELETE',
    });
  },
};
