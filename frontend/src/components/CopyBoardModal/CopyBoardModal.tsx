import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Modal from '@/components/Modal/Modal';
import { Button } from '@/components/Button/Button';
import { StyledButton } from '@/components/Modal/styles';
import { boardsApi } from '@/api/boards';
import { useBoardCategories } from '@/context/BoardCategoriesContext';
import type { BoardCategoryTreeNode } from '@/api/boardCategories';
import type { Task, TaskStatus } from '@/api/tasks';
import TreeItem from '@/components/Collapsible/TreeItem';

const COLUMN_IDS: TaskStatus[] = ['todo', 'in_progress', 'verification', 'done'];
const COLUMN_TITLES: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  verification: 'Verification',
  done: 'Done',
};

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 12px;
  font-size: 13px;
`;

const CategorySelectorLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CategorySelectorTree = styled.div`
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  background: ${({ theme }) => theme.colors.surface};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TasksLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TaskListByColumn = styled.div`
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
`;

const TaskColumn = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  &:last-child {
    margin-bottom: 0;
  }
`;

const TaskColumnTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const TaskRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
`;

interface CopyBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  boardId: number;
  boardName: string;
  tasks: Task[];
}

const CategoryTreeItem: React.FC<{
  node: BoardCategoryTreeNode;
  selectedCategoryId: number | null;
  onSelect: (id: number) => void;
  indent?: number;
}> = ({ node, selectedCategoryId, onSelect, indent = 0 }) => {
  if (node.children.length > 0) {
    return (
      <TreeItem
        label={node.name}
        indent={indent}
        onHeaderClick={() => onSelect(node.id)}
        selected={selectedCategoryId === node.id}
      >
        {node.children.map((child: BoardCategoryTreeNode) => (
          <CategoryTreeItem
            key={child.id}
            node={child}
            selectedCategoryId={selectedCategoryId}
            onSelect={onSelect}
            indent={indent + 1}
          />
        ))}
      </TreeItem>
    );
  }

  return (
    <TreeItem
      label={node.name}
      indent={indent}
      onClick={() => onSelect(node.id)}
      selected={selectedCategoryId === node.id}
    />
  );
};

const CopyBoardModal: React.FC<CopyBoardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  boardId,
  boardName,
  tasks,
}) => {
  const navigate = useNavigate();
  const { tree: categoryTree } = useBoardCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const tasksByStatus = useMemo(
    () =>
      COLUMN_IDS.reduce<Record<TaskStatus, Task[]>>(
        (acc, status) => {
          acc[status] = [...tasks.filter((t) => t.status === status)].sort(
            (a, b) => (a.position ?? 0) - (b.position ?? 0)
          );
          return acc;
        },
        { todo: [], in_progress: [], verification: [], done: [] }
      ),
    [tasks]
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryId(categoryTree.length > 0 ? categoryTree[0].id : null);
      setSelectedTaskIds(new Set(tasks.map((t) => t.id)));
      setError('');
    }
  }, [isOpen, categoryTree, tasks]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const toggleTask = (taskId: number) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedTaskIds(new Set(tasks.map((t) => t.id)));
    else setSelectedTaskIds(new Set());
  };

  const handleSubmit = async () => {
    if (loading) return;
    setError('');
    if (selectedCategoryId == null || selectedCategoryId <= 0) {
      setError('Wybierz kategorię docelową.');
      return;
    }
    if (selectedTaskIds.size === 0) {
      setError('Zaznacz co najmniej jedno zadanie do skopiowania.');
      return;
    }

    setLoading(true);
    try {
      const { board } = await boardsApi.copy(boardId, {
        board_category_id: selectedCategoryId,
        task_ids: Array.from(selectedTaskIds),
      });
      handleClose();
      onSuccess();
      navigate(`/board/${board.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd serwera.');
    } finally {
      setLoading(false);
    }
  };

  const allSelected = tasks.length > 0 && selectedTaskIds.size === tasks.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Stwórz kopię: ${boardName}`}
      maxWidth="480px"
      width="480px"
      loading={loading}
      footer={
        <>
          <StyledButton type="button" $variant="secondary" onClick={handleClose} disabled={loading}>
            Anuluj
          </StyledButton>
          <Button type="button" variant="primary" onClick={handleSubmit} loading={loading}>
            Stwórz kopię
          </Button>
        </>
      }
    >
      {error && <ErrorText>{error}</ErrorText>}

      <CategorySelectorLabel>Kategoria docelowa</CategorySelectorLabel>
      <CategorySelectorTree>
        {categoryTree.length === 0 ? (
          <div style={{ padding: 8, color: 'var(--colors-textSecondary)' }}>
            Brak kategorii. Dodaj najpierw kategorię tablic.
          </div>
        ) : (
          categoryTree.map((node) => (
            <CategoryTreeItem
              key={node.id}
              node={node}
              selectedCategoryId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          ))
        )}
      </CategorySelectorTree>

      <TasksLabel>Zadania do skopiowania</TasksLabel>
      <TaskRow>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
        <span>Zaznacz wszystkie</span>
      </TaskRow>
      <TaskListByColumn>
        {COLUMN_IDS.map((status) => (
          <TaskColumn key={status}>
            <TaskColumnTitle>{COLUMN_TITLES[status]}</TaskColumnTitle>
            {tasksByStatus[status].map((task) => (
              <TaskRow key={task.id}>
                <input
                  type="checkbox"
                  checked={selectedTaskIds.has(task.id)}
                  onChange={() => toggleTask(task.id)}
                />
                <span>{task.title}</span>
              </TaskRow>
            ))}
          </TaskColumn>
        ))}
      </TaskListByColumn>
    </Modal>
  );
};

export default CopyBoardModal;
