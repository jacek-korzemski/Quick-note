import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  articleCategoriesApi,
  type ArticleCategory,
  type ArticleCategoryTreeNode,
} from '@/api/articleCategories';
import { useAuth } from '@/context/AuthContext';

export type { ArticleCategoryTreeNode };

interface ArticleCategoriesContextType {
  articleCategories: ArticleCategory[];
  tree: ArticleCategoryTreeNode[];
  selectedArticleCategoryId: number | null;
  setSelectedArticleCategoryId: (id: number | null) => void;
  loading: boolean;
  refreshArticleCategories: () => Promise<void>;
}

const ArticleCategoriesContext = createContext<ArticleCategoriesContextType | null>(null);

function buildTree(
  items: ArticleCategory[],
  parentId: number | null = null
): ArticleCategoryTreeNode[] {
  return items
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({
      ...c,
      children: buildTree(items, c.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function ArticleCategoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [articleCategories, setArticleCategories] = useState<ArticleCategory[]>([]);
  const [selectedArticleCategoryId, setSelectedArticleCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshArticleCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { article_categories: data } = await articleCategoriesApi.getAll();
      setArticleCategories(data);
    } catch {
      setArticleCategories([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshArticleCategories();
    } else {
      setArticleCategories([]);
      setSelectedArticleCategoryId(null);
    }
  }, [user, refreshArticleCategories]);

  const tree = buildTree(articleCategories);

  return (
    <ArticleCategoriesContext.Provider
      value={{
        articleCategories,
        tree,
        selectedArticleCategoryId,
        setSelectedArticleCategoryId,
        loading,
        refreshArticleCategories,
      }}
    >
      {children}
    </ArticleCategoriesContext.Provider>
  );
}

export function useArticleCategories() {
  const context = useContext(ArticleCategoriesContext);
  if (!context) {
    throw new Error('useArticleCategories must be used within an ArticleCategoriesProvider');
  }
  return context;
}

