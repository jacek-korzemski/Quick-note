import { API_BASE_URL } from '@/config';

const API_BASE = `${API_BASE_URL}/api/time`;

export interface TimeEntry {
  id: number;
  user_id: number;
  task_id: number;
  start_datetime: string;
  end_datetime: string;
  created_at: string;
  title: string;
  description: string;
  duration_minutes: number;
  comment: string;
}

export interface TimeTask {
  id: number;
  user_id: number;
  title: string;
  description: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  comment: string;
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
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as ApiError).error || 'Wystąpił błąd serwera.');
  }

  return data as T;
}

export const timeTrackerApi = {
  getWeek(from: string) {
    const search = new URLSearchParams();
    if (from) search.set('from', from);
    const q = search.toString();
    return request<{ entries: TimeEntry[] }>(`/week${q ? `?${q}` : ''}`);
  },

  createTask(data: { title: string; description?: string; start_datetime: string; duration_minutes: number }) {
    return request<{ task: TimeTask; entries: TimeEntry[] }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTask(
    id: number,
    data: { title?: string; description?: string; comment?: string; duration_minutes?: number }
  ) {
    return request<{ task: TimeTask; entries: TimeEntry[] }>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteTask(id: number) {
    return request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

