import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Button } from '@/components/Button/Button';
import { boardsApi, type Board } from '@/api/boards';
import { tasksApi, type Task, type TaskStatus } from '@/api/tasks';
import TaskEditorModal from '@/components/TaskEditorModal/TaskEditorModal';
import { DroppableColumn } from '@/components/BoardView/DroppableColumn';
import ConfirmDialog from '@/components/Modal/ConfirmDialog';
import CopyBoardModal from '@/components/CopyBoardModal/CopyBoardModal';

const COLUMN_IDS: TaskStatus[] = ['todo', 'in_progress', 'verification', 'done'];
const COLUMN_TITLES: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  verification: 'Verification',
  done: 'Done',
};

const BoardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ColumnsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  min-height: 400px;
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.md};
`;

export const BOARD_REFRESH_EVENT = 'boards-refresh';

const BoardView: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);

  const id = boardId ? Number(boardId) : 0;
  const isArchived = board != null && board.archived_at != null && board.archived_at !== '';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const refreshTasks = useCallback(async () => {
    if (!id) return;
    try {
      const { tasks: data } = await tasksApi.getByBoard(id);
      setTasks(data);
    } catch {
      setTasks([]);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    boardsApi
      .getById(id)
      .then(({ board: b }) => {
        if (!cancelled) setBoard(b);
      })
      .catch(() => {
        if (!cancelled) setBoard(null);
      });

    tasksApi
      .getByBoard(id)
      .then(({ tasks: data }) => {
        if (!cancelled) setTasks(data);
      })
      .catch(() => {
        if (!cancelled) setTasks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleTaskModalSuccess = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
    refreshTasks();
  };

  const handleArchiveConfirm = async () => {
    if (!id) return;
    setArchiveLoading(true);
    try {
      await boardsApi.archive(id);
      setArchiveConfirmOpen(false);
      window.dispatchEvent(new CustomEvent(BOARD_REFRESH_EVENT));
      navigate('/');
    } catch {
      // error could be shown via snackbar
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || over.id === active.id) return;
    const activeIdStr = String(active.id);
    if (!activeIdStr.startsWith('task-')) return;
    const activeTaskId = Number(activeIdStr.replace(/^task-/, ''));
    if (Number.isNaN(activeTaskId)) return;
    const activeTask = tasks.find((t) => t.id === activeTaskId);
    if (!activeTask) return;

    const tasksByStatusForReorder = COLUMN_IDS.reduce<Record<TaskStatus, Task[]>>(
      (acc, status) => {
        acc[status] = [...tasks.filter((t) => t.status === status)].sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0)
        );
        return acc;
      },
      { todo: [], in_progress: [], verification: [], done: [] }
    );

    if (COLUMN_IDS.includes(over.id as TaskStatus)) {
      const newStatus = over.id as TaskStatus;
      if (activeTask.status === newStatus) return;
      const currentIds = tasksByStatusForReorder[newStatus].map((t) => t.id);
      tasksApi.reorder(id, newStatus, [...currentIds, activeTaskId]).then(() => refreshTasks());
      return;
    }

    const overIdStr = String(over.id);
    if (!overIdStr.startsWith('task-')) return;
    const overTaskId = Number(overIdStr.replace(/^task-/, ''));
    if (Number.isNaN(overTaskId)) return;
    const overTask = tasks.find((t) => t.id === overTaskId);
    if (!overTask) return;

    const columnTasks = tasksByStatusForReorder[overTask.status];
    const activeIndex = columnTasks.findIndex((t) => t.id === activeTaskId);
    const overIndex = columnTasks.findIndex((t) => t.id === overTaskId);
    if (activeIndex < 0 || overIndex < 0) return;

    const idsWithoutActive = columnTasks.map((t) => t.id).filter((tid) => tid !== activeTaskId);
    const overIndexInNew = idsWithoutActive.indexOf(overTaskId);
    if (overIndexInNew < 0) return;

    // Moving down (active was above over): insert after over. Moving up (active was below over): insert before over.
    const insertAtIndex = activeIndex < overIndex ? overIndexInNew + 1 : overIndexInNew;
    const newOrder = [...idsWithoutActive];
    newOrder.splice(insertAtIndex, 0, activeTaskId);
    tasksApi.reorder(id, overTask.status, newOrder).then(() => refreshTasks());
  };

  if (!boardId) return null;
  if (loading) return <EmptyState>Ładowanie...</EmptyState>;
  if (!board) return <EmptyState>Tablica nie została znaleziona.</EmptyState>;

  const tasksByStatus = COLUMN_IDS.reduce<Record<TaskStatus, Task[]>>(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    { todo: [], in_progress: [], verification: [], done: [] }
  );

  return (
    <>
      <BoardHeader>
        <h1>{board.name}</h1>
        {!isArchived && (
          <>
            <Button variant="primary" onClick={handleAddTask}>
              Dodaj zadanie
            </Button>
            <Button variant="secondary" onClick={() => setArchiveConfirmOpen(true)}>
              Zakończ projekt
            </Button>
          </>
        )}
        {isArchived && (
          <Button variant="primary" onClick={() => setCopyModalOpen(true)}>
            Stwórz kopię
          </Button>
        )}
      </BoardHeader>
      <DndContext sensors={sensors} onDragEnd={isArchived ? () => {} : handleDragEnd}>
        <ColumnsGrid>
          {COLUMN_IDS.map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              title={COLUMN_TITLES[status]}
              tasks={tasksByStatus[status]}
              onTaskClick={handleEditTask}
              readOnly={isArchived}
            />
          ))}
        </ColumnsGrid>
      </DndContext>
      <TaskEditorModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={handleTaskModalSuccess}
        boardId={id}
        task={editingTask}
        readOnly={isArchived}
      />
      <ConfirmDialog
        isOpen={archiveConfirmOpen}
        onConfirm={handleArchiveConfirm}
        onCancel={() => !archiveLoading && setArchiveConfirmOpen(false)}
        title="Zakończ projekt"
        message="Czy na pewno chcesz zakończyć ten projekt? Tablica zostanie przeniesiona do archiwum i będzie tylko do odczytu."
        confirmText="Zakończ"
        cancelText="Anuluj"
        variant="danger"
        loading={archiveLoading}
      />
      <CopyBoardModal
        isOpen={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        onSuccess={() => {
          setCopyModalOpen(false);
          window.dispatchEvent(new CustomEvent(BOARD_REFRESH_EVENT));
        }}
        boardId={id}
        boardName={board.name}
        tasks={tasks}
      />
    </>
  );
};

export default BoardView;
