import { API_BASE_URL } from '@/config';

const API_BASE = `${API_BASE_URL}/api/notes`;

export type NoteLabel = 'none' | 'info' | 'warning' | 'error' | 'success';

export interface Note {
  id: number;
  title: string;
  content: string;
  label: NoteLabel;
  created_at: string;
  updated_at: string | null;
  user_id: number;
  category_id: number | null;
  position?: number;
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

export const notesApi = {
  getAll(categoryId?: number | null) {
    const params = categoryId != null ? `?category_id=${categoryId}` : '';
    return request<{ notes: Note[] }>(params);
  },

  create(data: { title: string; content: string; label: NoteLabel; category_id?: number | null }) {
    return request<{ note: Note }>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: { title: string; content: string; label: NoteLabel; category_id?: number | null }) {
    return request<{ note: Note }>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: number) {
    return request<{ message: string }>(`/${id}`, {
      method: 'DELETE',
    });
  },

  reorder(noteIds: number[], categoryId?: number | null) {
    const params = new URLSearchParams();
    if (categoryId != null) params.set('category_id', String(categoryId));
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ notes: Note[] }>(`/reorder${query}`, {
      method: 'PUT',
      body: JSON.stringify({ note_ids: noteIds }),
    });
  },
};
