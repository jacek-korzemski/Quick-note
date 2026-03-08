import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  boardCategoriesApi,
  type BoardCategory,
  type BoardCategoryTreeNode,
} from '@/api/boardCategories';

export type { BoardCategoryTreeNode };
import { useAuth } from '@/context/AuthContext';

interface BoardCategoriesContextType {
  boardCategories: BoardCategory[];
  tree: BoardCategoryTreeNode[];
  selectedBoardCategoryId: number | null;
  setSelectedBoardCategoryId: (id: number | null) => void;
  loading: boolean;
  refreshBoardCategories: () => Promise<void>;
}

const BoardCategoriesContext = createContext<BoardCategoriesContextType | null>(null);

function buildTree(
  items: BoardCategory[],
  parentId: number | null = null
): BoardCategoryTreeNode[] {
  return items
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({
      ...c,
      children: buildTree(items, c.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function BoardCategoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [boardCategories, setBoardCategories] = useState<BoardCategory[]>([]);
  const [selectedBoardCategoryId, setSelectedBoardCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshBoardCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { board_categories: data } = await boardCategoriesApi.getAll();
      setBoardCategories(data);
    } catch {
      setBoardCategories([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshBoardCategories();
    } else {
      setBoardCategories([]);
      setSelectedBoardCategoryId(null);
    }
  }, [user, refreshBoardCategories]);

  const tree = buildTree(boardCategories);

  return (
    <BoardCategoriesContext.Provider
      value={{
        boardCategories,
        tree,
        selectedBoardCategoryId,
        setSelectedBoardCategoryId,
        loading,
        refreshBoardCategories,
      }}
    >
      {children}
    </BoardCategoriesContext.Provider>
  );
}

export function useBoardCategories() {
  const context = useContext(BoardCategoriesContext);
  if (!context) {
    throw new Error('useBoardCategories must be used within a BoardCategoriesProvider');
  }
  return context;
}
