import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';
import NoteCard from '@/components/NoteCard/NoteCard';
import type { Note } from '@/api/notes';

const DraggableWrapper = styled.div<{
  $isDragging?: boolean;
  $isOver?: boolean;
  $readOnly?: boolean;
}>`
  cursor: ${({ $readOnly }) => ($readOnly ? 'default' : 'grab')};
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  outline: ${({ theme, $isOver }) =>
    $isOver ? `2px solid ${theme.colors.borderFocus}` : '2px solid transparent'};
  outline-offset: -2px;
  &:active {
    cursor: ${({ $readOnly }) => ($readOnly ? 'default' : 'grabbing')};
  }
`;

interface DraggableNoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  readOnly?: boolean;
}

export function DraggableNoteCard({
  note,
  onEdit,
  onDelete,
  readOnly,
}: DraggableNoteCardProps) {
  const id = `note-${note.id}`;
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id,
    data: { note },
    disabled: readOnly,
  });
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id, disabled: readOnly });
  const setNodeRef = (el: HTMLDivElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <DraggableWrapper
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
      $isOver={isOver}
      $readOnly={readOnly}
      {...(readOnly ? {} : { ...listeners, ...attributes })}
    >
      <NoteCard note={note} onEdit={onEdit} onDelete={onDelete} />
    </DraggableWrapper>
  );
}
