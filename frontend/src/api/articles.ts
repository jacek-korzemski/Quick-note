import { API_BASE_URL } from '@/config';

const API_BASE = `${API_BASE_URL}/api/articles`;

export interface Article {
  id: number;
  title: string;
  content_html: string;
  created_at: string;
  updated_at: string | null;
  locked_at: string | null;
  user_id: number;
  article_category_id: number | null;
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

export const articlesApi = {
  getAll(articleCategoryId?: number | null) {
    const search = new URLSearchParams();
    if (articleCategoryId != null) search.set('article_category_id', String(articleCategoryId));
    const q = search.toString();
    return request<{ articles: Article[] }>(q ? `?${q}` : '');
  },

  getOne(id: number) {
    return request<{ article: Article }>(`/${id}`);
  },

  create(data: { title: string; article_category_id?: number | null }) {
    return request<{ article: Article }>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(
    id: number,
    data: {
      title?: string;
      content_html?: string;
      article_category_id?: number | null;
      locked?: boolean;
    }
  ) {
    return request<{ article: Article }>(`/${id}`, {
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

