import { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useAuth } from '@/context/AuthContext';
import { useNotes } from '@/context/NotesContext';
import { useCategories } from '@/context/CategoriesContext';
import NoteCard from '@/components/NoteCard/NoteCard';
import NoteEditorModal from '@/components/NoteEditorModal/NoteEditorModal';
import ConfirmDialog from '@/components/Modal/ConfirmDialog';
import Modal from '@/components/Modal/Modal';
import IconButton from '@/components/Button/IconButton';
import InfoIcon from '@/components/Icon/InfoIcon';
import Input from '@/components/Form/Input';
import { Select } from '@/components/Form/Select';
import { notesApi, type Note } from '@/api/notes';
import {
  getCategoryPath,
  matchesSearch,
  sortNotes,
  SORT_OPTIONS,
  type SortOption,
} from './notesSearchSort';
import { DraggableNoteCard } from './DraggableNoteCard';

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const SearchInputWrapper = styled.div`
  min-width: 200px;
  flex: 1;
`;

const SortSelectWrapper = styled.div`
  min-width: 220px;
`;

const InfoButtonWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  padding-bottom: 2px;
`;

const HelpSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  &:last-child {
    margin-bottom: 0;
  }
`;

const HelpTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const HelpText = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const HelpList = styled.ul`
  margin: 0;
  padding-left: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

const HelpExample = styled.code`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2px 6px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.fontSize.xs};
`;

const NOTES_LIST_ID = 'notes-list';

const NotesGrid = styled.div<{ $isOver?: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  min-height: 120px;
  background: ${({ theme, $isOver }) =>
    $isOver ? theme.colors.surfaceHover : 'transparent'};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: background 0.15s;
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.md};
`;

function DroppableNotesGrid({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: NOTES_LIST_ID });
  return (
    <NotesGrid ref={setNodeRef} $isOver={isOver}>
      {children}
    </NotesGrid>
  );
}

const NotesContent: React.FC = () => {
  const { user } = useAuth();
  const { notes, loading, refreshNotes } = useNotes();
  const { categories, selectedCategoryId } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('user_order');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const filteredAndSortedNotes = useMemo(() => {
    const filtered = notes.filter((n) =>
      matchesSearch(n, searchQuery, getCategoryPath, categories)
    );
    return sortNotes(filtered, sortOption);
  }, [notes, searchQuery, sortOption, categories]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (sortOption !== 'user_order') return;
      const { active, over } = event;
      if (!over || over.id === active.id) return;
      const activeIdStr = String(active.id);
      if (!activeIdStr.startsWith('note-')) return;
      const activeNoteId = Number(activeIdStr.replace(/^note-/, ''));
      if (Number.isNaN(activeNoteId)) return;
      const currentIds = filteredAndSortedNotes.map((n) => n.id);
      if (!currentIds.includes(activeNoteId)) return;

      let newOrder: number[];
      if (over.id === NOTES_LIST_ID) {
        const idsWithoutActive = currentIds.filter((id) => id !== activeNoteId);
        newOrder = [...idsWithoutActive, activeNoteId];
      } else {
        const overIdStr = String(over.id);
        if (!overIdStr.startsWith('note-')) return;
        const overNoteId = Number(overIdStr.replace(/^note-/, ''));
        if (Number.isNaN(overNoteId)) return;
        const activeIndex = filteredAndSortedNotes.findIndex((n) => n.id === activeNoteId);
        const overIndex = filteredAndSortedNotes.findIndex((n) => n.id === overNoteId);
        if (activeIndex < 0 || overIndex < 0) return;
        const idsWithoutActive = currentIds.filter((id) => id !== activeNoteId);
        const overIndexInNew = idsWithoutActive.indexOf(overNoteId);
        if (overIndexInNew < 0) return;
        const insertAtIndex = activeIndex < overIndex ? overIndexInNew + 1 : overIndexInNew;
        newOrder = [...idsWithoutActive];
        newOrder.splice(insertAtIndex, 0, activeNoteId);
      }

      notesApi.reorder(newOrder, selectedCategoryId ?? undefined).then(() => refreshNotes());
    },
    [sortOption, filteredAndSortedNotes, selectedCategoryId, refreshNotes]
  );

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingNote(null);
  };

  const handleEditorSuccess = () => {
    refreshNotes();
  };

  const handleDeleteClick = (note: Note) => {
    setDeleteNote(note);
  };

  const handleConfirmDelete = async () => {
    if (!deleteNote) return;
    setDeleteLoading(true);
    try {
      await notesApi.delete(deleteNote.id);
      setDeleteNote(null);
      refreshNotes();
    } catch {
      // Error handling - could use snackbar
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <EmptyState>
        Zaloguj się, aby przeglądać i tworzyć notatki.
      </EmptyState>
    );
  }

  return (
    <>
      <Toolbar>
        <SearchInputWrapper>
          <Input
            label="Szukaj"
            placeholder="Nazwa, data, treść, oznaczenie, kategoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchInputWrapper>
        <SortSelectWrapper>
          <Select
            label="Sortowanie"
            options={SORT_OPTIONS}
            value={sortOption}
            onChange={(v: string) => setSortOption(v as SortOption)}
            placeholder="Wybierz sortowanie"
          />
        </SortSelectWrapper>
        <InfoButtonWrapper>
          <IconButton
            onClick={() => setHelpModalOpen(true)}
            aria-label="Pomoc – jak wyszukiwać"
            title="Pomoc – jak wyszukiwać"
          >
            <InfoIcon />
          </IconButton>
        </InfoButtonWrapper>
      </Toolbar>

      <Modal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="Jak wyszukiwać notatki"
        variant="fit-content"
      >
        <HelpSection>
          <HelpTitle>Format daty</HelpTitle>
          <HelpText>
            Datę możesz wpisać w formacie dzień.miesią.rok lub z godziną, np.{' '}
            <HelpExample>12.03.2025</HelpExample> lub <HelpExample>14:30</HelpExample>.
            Wyszukiwanie dopasowuje się do dat utworzenia i modyfikacji notatki.
          </HelpText>
        </HelpSection>
        <HelpSection>
          <HelpTitle>Oznaczenia</HelpTitle>
          <HelpText>
            Szukaj po nazwie oznaczenia (bez rozróżniania wielkości liter):{' '}
            <HelpExample>brak</HelpExample>, <HelpExample>info</HelpExample>,{' '}
            <HelpExample>ostrzeżenie</HelpExample>, <HelpExample>błąd</HelpExample>,{' '}
            <HelpExample>sukces</HelpExample>.
          </HelpText>
        </HelpSection>
        <HelpSection>
          <HelpTitle>Kategoria</HelpTitle>
          <HelpText>
            Możesz wpisać fragment ścieżki kategorii. Notatki są przypisane do jednej kategorii
            (liścia drzewa), ale wyszukiwanie znajdzie notatkę, jeśli podany fragment występuje
            gdziekolwiek w ścieżce od korzenia do tej kategorii. Np. wpisując{' '}
            <HelpExample>podkategoria</HelpExample> znajdziesz notatkę z kategorią
            „kategoria/podkategoria/podkategoria2/podkategoria3”.
          </HelpText>
        </HelpSection>
        <HelpSection>
          <HelpTitle>Przykłady wyszukań</HelpTitle>
          <HelpList>
            <li>
              <HelpExample>test</HelpExample> — w tytule lub treści notatki
            </li>
            <li>
              <HelpExample>błąd</HelpExample> — notatki z oznaczeniem „błąd”
            </li>
            <li>
              <HelpExample>12.03</HelpExample> — po dacie (dzień i miesiąc)
            </li>
            <li>
              <HelpExample>podkategoria</HelpExample> — po fragmencie ścieżki kategorii
            </li>
            <li>
              <HelpExample>sukces</HelpExample> — notatki z oznaczeniem „sukces”
            </li>
          </HelpList>
        </HelpSection>
      </Modal>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <DroppableNotesGrid>
          {loading ? (
            <EmptyState>Ładowanie...</EmptyState>
          ) : notes.length === 0 ? (
            <EmptyState>Brak notatek. Kliknij „Add Note” w panelu bocznym, aby utworzyć pierwszą notatkę.</EmptyState>
          ) : filteredAndSortedNotes.length === 0 ? (
            <EmptyState>Brak notatek spełniających kryteria wyszukiwania.</EmptyState>
          ) : sortOption === 'user_order' ? (
            filteredAndSortedNotes.map((note) => (
              <DraggableNoteCard
                key={note.id}
                note={note}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
                readOnly={false}
              />
            ))
          ) : (
            filteredAndSortedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
              />
            ))
          )}
        </DroppableNotesGrid>
      </DndContext>

      <NoteEditorModal
        isOpen={editorOpen}
        onClose={handleCloseEditor}
        onSuccess={handleEditorSuccess}
        note={editingNote}
      />

      <ConfirmDialog
        isOpen={!!deleteNote}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleteLoading && setDeleteNote(null)}
        title="Usuń notatkę"
        message={deleteNote ? `Czy na pewno chcesz usunąć notatkę „${deleteNote.title}"?` : ''}
        confirmText="Usuń"
        cancelText="Anuluj"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
};

export default NotesContent;
