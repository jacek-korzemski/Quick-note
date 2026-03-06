const API_BASE = '/api/categories';

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
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

export const categoriesApi = {
  getAll() {
    return request<{ categories: Category[] }>('');
  },

  create(data: { name: string; parent_id?: number | null }) {
    return request<{ category: Category }>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: { name?: string; parent_id?: number | null }) {
    return request<{ category: Category }>(`/${id}`, {
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
