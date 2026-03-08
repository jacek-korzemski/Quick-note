import { API_BASE_URL } from '@/config';

const API_BASE = `${API_BASE_URL}/api/boards`;

export interface Board {
  id: number;
  name: string;
  board_category_id: number | null;
  user_id: number;
  archived_at?: string | null;
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
  getAll(boardCategoryId?: number | null, archived?: boolean) {
    const search = new URLSearchParams();
    if (boardCategoryId != null) search.set('board_category_id', String(boardCategoryId));
    if (archived === true) search.set('archived', '1');
    const q = search.toString();
    return request<{ boards: Board[] }>(q ? `?${q}` : '');
  },

  getById(id: number) {
    return request<{ board: Board }>(`/${id}`);
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

  archive(id: number) {
    return request<{ board: Board }>(`/${id}/archive`, {
      method: 'POST',
    });
  },

  copy(
    id: number,
    data: { board_category_id: number; task_ids: number[] }
  ) {
    return request<{ board: Board }>(`/${id}/copy`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
