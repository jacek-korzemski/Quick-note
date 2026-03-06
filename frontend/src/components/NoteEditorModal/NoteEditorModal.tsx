import { useState, useEffect, type FormEvent } from 'react';
import styled from 'styled-components';
import Modal from '@/components/Modal/Modal';
import Input from '@/components/Form/Input';
import Textarea from '@/components/Form/Textarea';
import { Select } from '@/components/Form/Select';
import { Button } from '@/components/Button/Button';
import { StyledButton } from '@/components/Modal/styles';
import { notesApi, type Note, type NoteLabel } from '@/api/notes';
import { useCategories, type CategoryTreeNode } from '@/context/CategoriesContext';
import TreeItem from '@/components/Collapsible/TreeItem';

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

const CategorySelectorLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CategorySelectorTree = styled.div`
  max-height: 160px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  background: ${({ theme }) => theme.colors.surface};
`;

const LABEL_OPTIONS = [
  { value: 'none', label: 'Brak' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Ostrzeżenie' },
  { value: 'error', label: 'Błąd' },
  { value: 'success', label: 'Sukces' },
];

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  note?: Note | null;
}

const CategoryTreeItem: React.FC<{
  node: CategoryTreeNode;
  selectedCategoryId: number | null;
  onSelect: (id: number | null) => void;
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
        {node.children.map((child) => (
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

const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  note = null,
}) => {
  const { tree: categoryTree } = useCategories();
  const isEdit = !!note;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [label, setLabel] = useState<NoteLabel>('none');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setLabel(note.label);
        setCategoryId(note.category_id);
      } else {
        setTitle('');
        setContent('');
        setLabel('none');
        setCategoryId(null);
      }
      setError('');
    }
  }, [isOpen, note]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await notesApi.update(note!.id, { title, content, label, category_id: categoryId });
      } else {
        await notesApi.create({ title, content, label, category_id: categoryId });
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edytuj notatkę' : 'Nowa notatka'}
      maxWidth="520px"
      width="520px"
      loading={loading}
      footer={
        <>
          <StyledButton type="button" $variant="secondary" onClick={handleClose} disabled={loading}>
            Anuluj
          </StyledButton>
          <Button type="submit" form="note-editor-form" variant="primary" loading={loading}>
            {isEdit ? 'Zapisz' : 'Utwórz'}
          </Button>
        </>
      }
    >
      <form id="note-editor-form" onSubmit={handleSubmit}>
        {error && <ErrorText>{error}</ErrorText>}

        {isEdit && note?.created_at && (
          <MetaText>Utworzono: {formatDate(note.created_at)}</MetaText>
        )}

        <Input
          label="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tytuł notatki"
          fullWidth
          required
          autoFocus
        />

        <Textarea
          label="Treść"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Treść notatki..."
          fullWidth
          rows={6}
        />

        <div style={{ marginTop: 8 }}>
          <Select
            label="Oznaczenie"
            options={LABEL_OPTIONS}
            value={label}
            onChange={(v) => setLabel(v as NoteLabel)}
            fullWidth
            dropdownZIndex={400}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <CategorySelectorLabel>Kategoria</CategorySelectorLabel>
          <CategorySelectorTree>
            <TreeItem
              label="Brak kategorii"
              onClick={() => setCategoryId(null)}
              selected={categoryId === null}
            />
            {categoryTree.map((node) => (
              <CategoryTreeItem
                key={node.id}
                node={node}
                selectedCategoryId={categoryId}
                onSelect={setCategoryId}
              />
            ))}
          </CategorySelectorTree>
        </div>
      </form>
    </Modal>
  );
};

export default NoteEditorModal;
