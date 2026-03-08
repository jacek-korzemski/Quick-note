import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/api/tasks';
import styled from 'styled-components';

const TaskCard = styled.div<{ $isDragging?: boolean; $isOver?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid
    ${({ theme, $isOver }) => ($isOver ? theme.colors.borderFocus : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  cursor: grab;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1)};
  &:hover {
    border-color: ${({ theme }) => theme.colors.borderLight};
  }
  &:active {
    cursor: grabbing;
  }
`;

const TaskCardTitle = styled.div`
  font-weight: 500;
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const TaskCardMeta = styled.div`
  margin-top: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  gap: 8px;
`;

const DifficultyBadge = styled.span`
  background: ${({ theme }) => theme.colors.tertiary};
  padding: 2px 6px;
  border-radius: 4px;
`;

interface DraggableTaskCardProps {
  task: Task;
  onClick: () => void;
}

export function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
  const id = `task-${task.id}`;
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id,
    data: { task },
  });
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id });
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
    <TaskCard
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
      $isOver={isOver}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <TaskCardTitle>{task.title}</TaskCardTitle>
      <TaskCardMeta>
        <DifficultyBadge>Trudność: {task.difficulty}</DifficultyBadge>
        <span>
          {new Date(task.created_at).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
      </TaskCardMeta>
    </TaskCard>
  );
}
