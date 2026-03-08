import { useState, useEffect, type FormEvent } from 'react';
import styled from 'styled-components';
import Modal from '@/components/Modal/Modal';
import Input from '@/components/Form/Input';
import { Button } from '@/components/Button/Button';
import { StyledButton } from '@/components/Modal/styles';
import { boardsApi } from '@/api/boards';
import { useBoardCategories } from '@/context/BoardCategoriesContext';
import type { BoardCategoryTreeNode } from '@/api/boardCategories';
import TreeItem from '@/components/Collapsible/TreeItem';

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
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  background: ${({ theme }) => theme.colors.surface};
`;

interface BoardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

const BoardEditorModal: React.FC<BoardEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { tree: categoryTree } = useBoardCategories();
  const [name, setName] = useState('');
  const [boardCategoryId, setBoardCategoryId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setBoardCategoryId(categoryTree.length > 0 ? categoryTree[0].id : null);
      setError('');
    }
  }, [isOpen, categoryTree]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Nazwa tablicy jest wymagana.');
      return;
    }
    if (boardCategoryId == null || boardCategoryId <= 0) {
      setError('Wybierz kategorię tablicy.');
      return;
    }

    setLoading(true);
    try {
      await boardsApi.create({
        name: trimmedName,
        board_category_id: boardCategoryId,
      });
      handleClose();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd serwera.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nowa tablica"
      maxWidth="400px"
      width="400px"
      loading={loading}
      footer={
        <>
          <StyledButton type="button" $variant="secondary" onClick={handleClose} disabled={loading}>
            Anuluj
          </StyledButton>
          <Button type="submit" form="board-editor-form" variant="primary" loading={loading}>
            Utwórz
          </Button>
        </>
      }
    >
      <form id="board-editor-form" onSubmit={handleSubmit}>
        {error && <ErrorText>{error}</ErrorText>}

        <Input
          label="Nazwa tablicy"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Wpisz nazwę tablicy"
          fullWidth
          required
          autoFocus
        />

        <div style={{ marginTop: 16 }}>
          <CategorySelectorLabel>Kategoria tablicy</CategorySelectorLabel>
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
                  selectedCategoryId={boardCategoryId}
                  onSelect={setBoardCategoryId}
                />
              ))
            )}
          </CategorySelectorTree>
        </div>
      </form>
    </Modal>
  );
};

export default BoardEditorModal;
