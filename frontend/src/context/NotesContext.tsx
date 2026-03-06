import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { notesApi, type Note } from '@/api/notes';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/context/CategoriesContext';

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  refreshNotes: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { selectedCategoryId } = useCategories();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshNotes = useCallback(async (categoryId?: number | null) => {
    setLoading(true);
    try {
      const { notes: data } = await notesApi.getAll(categoryId);
      setNotes(data);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshNotes(selectedCategoryId);
    } else {
      setNotes([]);
    }
  }, [user, selectedCategoryId, refreshNotes]);

  const refreshNotesStable = useCallback(async () => {
    if (user) await refreshNotes(selectedCategoryId);
  }, [user, selectedCategoryId, refreshNotes]);

  return (
    <NotesContext.Provider value={{ notes, loading, refreshNotes: refreshNotesStable }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
