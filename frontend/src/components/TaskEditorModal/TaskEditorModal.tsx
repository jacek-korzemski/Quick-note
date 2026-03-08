import { useState, useEffect, type FormEvent } from 'react';
import styled from 'styled-components';
import Modal from '@/components/Modal/Modal';
import Input from '@/components/Form/Input';
import Textarea from '@/components/Form/Textarea';
import { Button } from '@/components/Button/Button';
import { StyledButton } from '@/components/Modal/styles';
import { tasksApi, type Task, type TaskHistoryEntry } from '@/api/tasks';

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 12px;
  font-size: 13px;
`;

const MetaText = styled.div`
  margin-bottom: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const HistorySection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const HistoryTitle = styled.h4`
  margin: 0 0 8px;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const HistoryList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 160px;
  overflow-y: auto;
`;

const HistoryItem = styled.li`
  padding: 6px 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: none;
  }
`;

const HistoryItemDesc = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  boardId: number;
  task: Task | null;
  readOnly?: boolean;
}

const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  boardId,
  task,
  readOnly = false,
}) => {
  const isEdit = !!task;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setContent(task.content ?? '');
        setDifficulty(task.difficulty ?? 0);
        setHistory(task.history ?? []);
      } else {
        setTitle('');
        setContent('');
        setDifficulty(0);
        setHistory([]);
      }
      setError('');
    }
  }, [isOpen, task]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || readOnly) return;
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        const updated = await tasksApi.update(boardId, task!.id, {
          title,
          content,
          difficulty,
        });
        setHistory(updated.task.history ?? []);
      } else {
        await tasksApi.create(boardId, { title, content, difficulty });
      }
      handleClose();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd.');
    } finally {
      setLoading(false);
    }
  };

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

  const modalTitle = readOnly ? 'Podgląd zadania' : isEdit ? 'Edytuj zadanie' : 'Nowe zadanie';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      maxWidth="520px"
      width="520px"
      loading={loading}
      footer={
        readOnly ? (
          <StyledButton type="button" $variant="secondary" onClick={handleClose}>
            Zamknij
          </StyledButton>
        ) : (
          <>
            <StyledButton type="button" $variant="secondary" onClick={handleClose} disabled={loading}>
              Anuluj
            </StyledButton>
            <Button type="submit" form="task-editor-form" variant="primary" loading={loading}>
              {isEdit ? 'Zapisz' : 'Utwórz'}
            </Button>
          </>
        )
      }
    >
      <form id="task-editor-form" onSubmit={handleSubmit}>
        {error && <ErrorText>{error}</ErrorText>}

        {isEdit && task?.created_at && (
          <MetaText>Utworzono: {formatDate(task.created_at)}</MetaText>
        )}

        <Input
          label="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tytuł zadania"
          fullWidth
          required
          autoFocus={!readOnly}
          disabled={readOnly}
        />

        <Textarea
          label="Treść"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Opis zadania..."
          fullWidth
          rows={4}
          disabled={readOnly}
        />

        <div style={{ marginTop: 8 }}>
          <Input
            label="Stopień trudności (liczba)"
            type="number"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value) || 0)}
            fullWidth
            disabled={readOnly}
          />
        </div>

        {isEdit && history.length > 0 && (
          <HistorySection>
            <HistoryTitle>Historia zmian</HistoryTitle>
            <HistoryList>
              {history.map((entry) => (
                <HistoryItem key={entry.id}>
                  {formatDate(entry.changed_at)} – <HistoryItemDesc>{entry.description}</HistoryItemDesc>
                </HistoryItem>
              ))}
            </HistoryList>
          </HistorySection>
        )}
      </form>
    </Modal>
  );
};

export default TaskEditorModal;
