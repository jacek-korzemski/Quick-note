import { API_BASE_URL } from '@/config';

const API_BASE = `${API_BASE_URL}/api/boards`;

export interface Board {
  id: number;
  name: string;
  board_category_id: number;
  user_id: number;
}

export interface ApiError {
  error: string;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as ApiError).error || 'Wystąpił błąd serwera.');
  }

  return data as T;
}

export const boardsApi = {
  getAll(boardCategoryId?: number | null) {
    const params = boardCategoryId != null ? `?board_category_id=${boardCategoryId}` : '';
    return request<{ boards: Board[] }>(params);
  },

  create(data: { name: string; board_category_id: number }) {
    return request<{ board: Board }>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: { name?: string; board_category_id?: number }) {
    return request<{ board: Board }>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: number) {
    return request<{ message: string }>(`/${id}`, {
      method: 'DELETE',
    });
  },
};
