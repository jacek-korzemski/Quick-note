import React from 'react';
import styled from 'styled-components';
import { Box } from '@/components/Box/Box';
import { IconButton } from '@/components/Box/styles';
import EditIcon from '@/components/Icon/EditIcon';
import TrashIcon from '@/components/Icon/TrashIcon';
import type { Note } from '@/api/notes';

const NoteMeta = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  return (
    <Box
      title={note.title}
      headerLabel={note.label}
      headerActions={
        <>
          <IconButton onClick={() => onEdit(note)} aria-label="Edytuj">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => onDelete(note)} aria-label="Usuń">
            <TrashIcon />
          </IconButton>
        </>
      }
      variant="outlined"
    >
      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {note.content || '\u00A0'}
      </div>
      <NoteMeta>
        Utworzono: {formatDate(note.created_at)}
        {note.updated_at && ` • Zmodyfikowano: ${formatDate(note.updated_at)}`}
      </NoteMeta>
    </Box>
  );
};

export default NoteCard;
