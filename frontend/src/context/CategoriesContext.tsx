import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { categoriesApi, type Category } from '@/api/categories';
import { useAuth } from '@/context/AuthContext';

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

interface CategoriesContextType {
  categories: Category[];
  tree: CategoryTreeNode[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  loading: boolean;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | null>(null);

function buildTree(items: Category[], parentId: number | null = null): CategoryTreeNode[] {
  return items
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({
      ...c,
      children: buildTree(items, c.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { categories: data } = await categoriesApi.getAll();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshCategories();
    } else {
      setCategories([]);
      setSelectedCategoryId(null);
    }
  }, [user, refreshCategories]);

  const tree = buildTree(categories);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        tree,
        selectedCategoryId,
        setSelectedCategoryId,
        loading,
        refreshCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
