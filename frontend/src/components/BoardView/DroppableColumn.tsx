import { useDroppable } from '@dnd-kit/core';
import type { TaskStatus } from '@/api/tasks';
import type { Task } from '@/api/tasks';
import styled from 'styled-components';
import { DraggableTaskCard } from './DraggableTaskCard';

const Column = styled.div<{ $isOver?: boolean }>`
  background: ${({ theme, $isOver }) =>
    $isOver ? theme.colors.surfaceHover : theme.colors.surface};
  border: 1px solid
    ${({ theme, $isOver }) => ($isOver ? theme.colors.borderFocus : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  transition: background 0.15s, border-color 0.15s;
`;

const ColumnTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const TaskCards = styled.div`
  flex: 1;
  min-height: 80px;
`;

interface DroppableColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function DroppableColumn({ status, title, tasks, onTaskClick }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <Column ref={setNodeRef} $isOver={isOver}>
      <ColumnTitle>{title}</ColumnTitle>
      <TaskCards>
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
      </TaskCards>
    </Column>
  );
}
