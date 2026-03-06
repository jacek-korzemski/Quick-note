import { useState } from "react";
import { Button } from "@/components/Button/Button";
import { useAuth } from "@/context/AuthContext";
import { useNotes } from "@/context/NotesContext";
import { useCategories } from "@/context/CategoriesContext";
import type { CategoryTreeNode } from "@/context/CategoriesContext";
import NoteEditorModal from "@/components/NoteEditorModal/NoteEditorModal";
import CategoryEditorModal from "@/components/CategoryEditorModal/CategoryEditorModal";
import ConfirmDialog from "@/components/Modal/ConfirmDialog";
import TreeItem from "@/components/Collapsible/TreeItem";
import { IconButton } from "@/components/Box/styles";
import TrashIcon from "@/components/Icon/TrashIcon";
import { categoriesApi } from "@/api/categories";
import styled from "styled-components";

const SidebarActionsWrapper = styled.div<{ flex?: boolean }>`
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  ${({ flex }) => (flex ? `flex-wrap: wrap;` : `flex-wrap: nowrap;`)}
`;

const CategoriesList = styled.div`
  width: 100%;
  margin-bottom: 8px;
`;

const CategoryTreeItem: React.FC<{
  node: CategoryTreeNode;
  selectedCategoryId: number | null;
  onSelect: (id: number) => void;
  onDelete: (node: CategoryTreeNode) => void;
  indent?: number;
}> = ({ node, selectedCategoryId, onSelect, onDelete, indent = 0 }) => {
  const deleteAction = (
    <IconButton
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(node);
      }}
      aria-label="Usuń kategorię"
    >
      <TrashIcon />
    </IconButton>
  );

  if (node.children.length > 0) {
    return (
      <TreeItem
        label={node.name}
        indent={indent}
        onHeaderClick={() => onSelect(node.id)}
        selected={selectedCategoryId === node.id}
        actions={deleteAction}
      >
        {node.children.map((child) => (
          <CategoryTreeItem
            key={child.id}
            node={child}
            selectedCategoryId={selectedCategoryId}
            onSelect={onSelect}
            onDelete={onDelete}
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
      actions={deleteAction}
    />
  );
};

const SidebarActions = () => {
  const { user } = useAuth();
  const { refreshNotes } = useNotes();
  const { tree, selectedCategoryId, setSelectedCategoryId, refreshCategories } = useCategories();
  const [editorOpen, setEditorOpen] = useState(false);
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<CategoryTreeNode | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;
    setDeleteLoading(true);
    try {
      await categoriesApi.delete(deleteCategory.id);
      if (selectedCategoryId === deleteCategory.id) {
        setSelectedCategoryId(deleteCategory.parent_id);
      }
      setDeleteCategory(null);
      refreshCategories();
      refreshNotes();
    } catch {
      // Error handling - could use snackbar
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <CategoriesList>
        <TreeItem
          label="Wszystkie notatki"
          onClick={() => setSelectedCategoryId(null)}
          selected={selectedCategoryId === null}
        />
        {tree.map((node) => (
          <CategoryTreeItem
            key={node.id}
            node={node}
            selectedCategoryId={selectedCategoryId}
            onSelect={(id) => setSelectedCategoryId(id)}
            onDelete={setDeleteCategory}
          />
        ))}
      </CategoriesList>
      <SidebarActionsWrapper>
        <Button variant="tertiary" fullWidth onClick={() => setCategoryEditorOpen(true)}>
          Add Category
        </Button>
        <Button variant="tertiary" fullWidth onClick={() => setEditorOpen(true)}>
          Add Note
        </Button>
        <NoteEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          onSuccess={() => {
            setEditorOpen(false);
            refreshNotes();
          }}
          note={null}
        />
        <CategoryEditorModal
          isOpen={categoryEditorOpen}
          onClose={() => setCategoryEditorOpen(false)}
          onSuccess={() => {
            setCategoryEditorOpen(false);
            refreshCategories();
          }}
        />
        <ConfirmDialog
          isOpen={!!deleteCategory}
          onConfirm={handleDeleteCategory}
          onCancel={() => !deleteLoading && setDeleteCategory(null)}
          title="Usuń kategorię"
          message={
            deleteCategory
              ? `Czy na pewno chcesz usunąć kategorię „${deleteCategory.name}"? Notatki z tej kategorii zostaną przeniesione do kategorii nadrzędnej (lub będą widoczne tylko w „Wszystkie notatki", jeśli brak nadrzędnej).`
              : ""
          }
          confirmText="Usuń"
          cancelText="Anuluj"
          variant="danger"
          loading={deleteLoading}
        />
      </SidebarActionsWrapper>
    </>
  );
};

export default SidebarActions;
