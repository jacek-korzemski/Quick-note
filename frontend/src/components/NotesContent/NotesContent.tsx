import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import { useNotes } from '@/context/NotesContext';
import NoteCard from '@/components/NoteCard/NoteCard';
import NoteEditorModal from '@/components/NoteEditorModal/NoteEditorModal';
import ConfirmDialog from '@/components/Modal/ConfirmDialog';
import { notesApi, type Note } from '@/api/notes';

const NotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.md};
`;

const NotesContent: React.FC = () => {
  const { user } = useAuth();
  const { notes, loading, refreshNotes } = useNotes();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      <NotesGrid>
        {loading ? (
          <EmptyState>Ładowanie...</EmptyState>
        ) : notes.length === 0 ? (
          <EmptyState>Brak notatek. Kliknij „Add Note” w panelu bocznym, aby utworzyć pierwszą notatkę.</EmptyState>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </NotesGrid>

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
