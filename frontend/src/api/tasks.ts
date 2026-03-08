import { API_BASE_URL } from '@/config';

const API_BASE = (boardId: number) => `${API_BASE_URL}/api/boards/${boardId}/tasks`;

export type TaskStatus = 'todo' | 'in_progress' | 'verification' | 'done';

export interface TaskHistoryEntry {
  id: number;
  task_id: number;
  changed_at: string;
  description: string;
}

export interface Task {
  id: number;
  board_id: number;
  title: string;
  content: string;
  difficulty: number;
  created_at: string;
  status: TaskStatus;
  position: number;
  history?: TaskHistoryEntry[];
}

export interface ApiError {
  error: string;
}

async function request<T>(
  boardId: number,
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE(boardId)}${url}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as ApiError).error || 'Wystąpił błąd serwera.');
  }

  return data as T;
}

export const tasksApi = {
  getByBoard(boardId: number) {
    return request<{ tasks: Task[] }>(boardId, '');
  },

  create(
    boardId: number,
    data: { title: string; content?: string; difficulty?: number }
  ) {
    return request<{ task: Task }>(boardId, '', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(
    boardId: number,
    taskId: number,
    data: {
      title?: string;
      content?: string;
      difficulty?: number;
      status?: TaskStatus;
    }
  ) {
    return request<{ task: Task }>(boardId, `/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(boardId: number, taskId: number) {
    return request<{ message: string }>(boardId, `/${taskId}`, {
      method: 'DELETE',
    });
  },

  reorder(boardId: number, status: TaskStatus, taskIds: number[]) {
    return request<{ tasks: Task[] }>(boardId, '/reorder', {
      method: 'PUT',
      body: JSON.stringify({ status, task_ids: taskIds }),
    });
  },
};
