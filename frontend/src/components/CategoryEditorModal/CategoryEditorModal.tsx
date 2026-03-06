import { useState, useEffect, type FormEvent } from 'react';
import styled from 'styled-components';
import Modal from '@/components/Modal/Modal';
import Input from '@/components/Form/Input';
import { Button } from '@/components/Button/Button';
import { StyledButton } from '@/components/Modal/styles';
import { categoriesApi } from '@/api/categories';
import { useCategories, type CategoryTreeNode } from '@/context/CategoriesContext';
import TreeItem from '@/components/Collapsible/TreeItem';

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 12px;
  font-size: 13px;
`;

const ParentSelectorLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ParentSelectorTree = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  background: ${({ theme }) => theme.colors.surface};
`;

interface CategoryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ParentTreeItem: React.FC<{
  node: CategoryTreeNode;
  selectedParentId: number | null;
  onSelect: (id: number | null) => void;
  indent?: number;
}> = ({ node, selectedParentId, onSelect, indent = 0 }) => {
  if (node.children.length > 0) {
    return (
      <TreeItem
        label={node.name}
        indent={indent}
        onHeaderClick={() => onSelect(node.id)}
        selected={selectedParentId === node.id}
      >
        {node.children.map((child) => (
          <ParentTreeItem
            key={child.id}
            node={child}
            selectedParentId={selectedParentId}
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
      selected={selectedParentId === node.id}
    />
  );
};

const CategoryEditorModal: React.FC<CategoryEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { tree: categoryTree } = useCategories();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setParentId(null);
      setError('');
    }
  }, [isOpen]);

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
      setError('Nazwa kategorii jest wymagana.');
      return;
    }

    setLoading(true);
    try {
      await categoriesApi.create({
        name: trimmedName,
        parent_id: parentId,
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
      title="Nowa kategoria"
      maxWidth="400px"
      width="400px"
      loading={loading}
      footer={
        <>
          <StyledButton type="button" $variant="secondary" onClick={handleClose} disabled={loading}>
            Anuluj
          </StyledButton>
          <Button type="submit" form="category-editor-form" variant="primary" loading={loading}>
            Utwórz
          </Button>
        </>
      }
    >
      <form id="category-editor-form" onSubmit={handleSubmit}>
        {error && <ErrorText>{error}</ErrorText>}

        <Input
          label="Nazwa kategorii"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Wpisz nazwę kategorii"
          fullWidth
          required
          autoFocus
        />

        <div style={{ marginTop: 16 }}>
          <ParentSelectorLabel>Kategoria nadrzędna</ParentSelectorLabel>
          <ParentSelectorTree>
            <TreeItem
              label="Brak (kategoria główna)"
              onClick={() => setParentId(null)}
              selected={parentId === null}
            />
            {categoryTree.map((node) => (
              <ParentTreeItem
                key={node.id}
                node={node}
                selectedParentId={parentId}
                onSelect={setParentId}
              />
            ))}
          </ParentSelectorTree>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryEditorModal;
