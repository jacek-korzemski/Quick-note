import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { articlesApi, type Article } from '@/api/articles';
import { useAuth } from '@/context/AuthContext';
import { useArticleCategories } from '@/context/ArticleCategoriesContext';

interface ArticlesContextType {
  articles: Article[];
  loading: boolean;
  refreshArticles: (categoryId?: number | null) => Promise<void>;
}

const ArticlesContext = createContext<ArticlesContextType | null>(null);

export function ArticlesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { selectedArticleCategoryId } = useArticleCategories();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshArticles = useCallback(async (categoryId?: number | null) => {
    setLoading(true);
    try {
      const { articles: data } = await articlesApi.getAll(categoryId);
      setArticles(data);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshArticles(selectedArticleCategoryId);
    } else {
      setArticles([]);
    }
  }, [user, selectedArticleCategoryId, refreshArticles]);

  const refreshArticlesStable = useCallback(
    async () => {
      if (user) await refreshArticles(selectedArticleCategoryId);
    },
    [user, selectedArticleCategoryId, refreshArticles]
  );

  return (
    <ArticlesContext.Provider value={{ articles, loading, refreshArticles: refreshArticlesStable }}>
      {children}
    </ArticlesContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticles must be used within an ArticlesProvider');
  }
  return context;
}

