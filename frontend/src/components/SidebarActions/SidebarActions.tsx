import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button/Button";
import { useAuth } from "@/context/AuthContext";
import { useNotes } from "@/context/NotesContext";
import { useCategories } from "@/context/CategoriesContext";
import { useBoardCategories } from "@/context/BoardCategoriesContext";
import type { CategoryTreeNode } from "@/context/CategoriesContext";
import type { BoardCategoryTreeNode } from "@/api/boardCategories";
import NoteEditorModal from "@/components/NoteEditorModal/NoteEditorModal";
import CategoryEditorModal from "@/components/CategoryEditorModal/CategoryEditorModal";
import BoardCategoryEditorModal from "@/components/BoardCategoryEditorModal/BoardCategoryEditorModal";
import BoardEditorModal from "@/components/BoardEditorModal/BoardEditorModal";
import ConfirmDialog from "@/components/Modal/ConfirmDialog";
import TreeItem from "@/components/Collapsible/TreeItem";
import { IconButton } from "@/components/Box/styles";
import TrashIcon from "@/components/Icon/TrashIcon";
import { categoriesApi } from "@/api/categories";
import { boardCategoriesApi } from "@/api/boardCategories";
import { boardsApi, type Board } from "@/api/boards";
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

const BoardLink = styled(Link)`
  display: block;
  padding: 6px 12px;
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
`;

const BoardsList = styled.div`
  padding-left: 8px;
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

const BoardCategoryTreeItem: React.FC<{
  node: BoardCategoryTreeNode;
  boardsByCategory: Record<number, Board[]>;
  onDeleteCategory: (node: BoardCategoryTreeNode) => void;
  onDeleteBoard: (board: Board) => void;
  indent?: number;
}> = ({ node, boardsByCategory, onDeleteCategory, onDeleteBoard, indent = 0 }) => {
  const boards = boardsByCategory[node.id] ?? [];
  const deleteCatAction = (
    <IconButton
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDeleteCategory(node);
      }}
      aria-label="Usuń kategorię"
    >
      <TrashIcon />
    </IconButton>
  );

  const content = (
    <>
      {boards.map((board) => (
        <div key={board.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BoardLink to={`/board/${board.id}`}>{board.name}</BoardLink>
          <IconButton
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDeleteBoard(board);
            }}
            aria-label="Usuń tablicę"
          >
            <TrashIcon />
          </IconButton>
        </div>
      ))}
      {node.children.map((child) => (
        <BoardCategoryTreeItem
          key={child.id}
          node={child}
          boardsByCategory={boardsByCategory}
          onDeleteCategory={onDeleteCategory}
          onDeleteBoard={onDeleteBoard}
          indent={indent + 1}
        />
      ))}
    </>
  );

  if (node.children.length > 0 || boards.length > 0) {
    return (
      <TreeItem
        label={node.name}
        indent={indent}
        onHeaderClick={() => {}}
        actions={deleteCatAction}
      >
        <BoardsList>{content}</BoardsList>
      </TreeItem>
    );
  }

  return (
    <TreeItem
      label={node.name}
      indent={indent}
      onClick={() => {}}
      actions={deleteCatAction}
    />
  );
};

const SidebarActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshNotes } = useNotes();
  const { tree, selectedCategoryId, setSelectedCategoryId, refreshCategories } = useCategories();
  const { tree: boardCategoryTree, refreshBoardCategories } = useBoardCategories();
  const [boards, setBoards] = useState<Board[]>([]);
  const [archivedBoards, setArchivedBoards] = useState<Board[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<CategoryTreeNode | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [boardCategoryEditorOpen, setBoardCategoryEditorOpen] = useState(false);
  const [boardEditorOpen, setBoardEditorOpen] = useState(false);
  const [deleteBoardCategory, setDeleteBoardCategory] = useState<BoardCategoryTreeNode | null>(null);
  const [deleteBoard, setDeleteBoard] = useState<Board | null>(null);
  const [deleteBoardCategoryLoading, setDeleteBoardCategoryLoading] = useState(false);
  const [deleteBoardLoading, setDeleteBoardLoading] = useState(false);

  const refreshBoards = useCallback(async () => {
    if (!user) return;
    try {
      const [{ boards: active }, { boards: archived }] = await Promise.all([
        boardsApi.getAll(),
        boardsApi.getAll(undefined, true),
      ]);
      setBoards(active);
      setArchivedBoards(archived);
    } catch {
      setBoards([]);
      setArchivedBoards([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) refreshBoards();
  }, [user, refreshBoards]);

  useEffect(() => {
    const handler = () => refreshBoards();
    window.addEventListener('boards-refresh', handler);
    return () => window.removeEventListener('boards-refresh', handler);
  }, [refreshBoards]);

  const boardsByCategory: Record<number, Board[]> = boards
    .filter((b) => b.board_category_id != null)
    .reduce<Record<number, Board[]>>(
      (acc, b) => {
        (acc[b.board_category_id!] = acc[b.board_category_id!] ?? []).push(b);
        return acc;
      },
      {}
    );

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

  const handleDeleteBoardCategory = async () => {
    if (!deleteBoardCategory) return;
    setDeleteBoardCategoryLoading(true);
    try {
      await boardCategoriesApi.delete(deleteBoardCategory.id);
      setDeleteBoardCategory(null);
      refreshBoardCategories();
      refreshBoards();
    } catch {
      // pass
    } finally {
      setDeleteBoardCategoryLoading(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!deleteBoard) return;
    setDeleteBoardLoading(true);
    try {
      await boardsApi.delete(deleteBoard.id);
      setDeleteBoard(null);
      refreshBoards();
    } catch {
      // pass
    } finally {
      setDeleteBoardLoading(false);
    }
  };

  const handleNotesSelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    navigate('/');
  };

  if (!user) return null;

  return (
    <>
      <CategoriesList>
        <h2>Notes</h2>
        <TreeItem
          label="Wszystkie notatki"
          onClick={() => handleNotesSelect(null)}
          selected={selectedCategoryId === null}
        />
        {tree.map((node) => (
          <CategoryTreeItem
            key={node.id}
            node={node}
            selectedCategoryId={selectedCategoryId}
            onSelect={(id) => handleNotesSelect(id)}
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
      <SidebarActionsWrapper flex>
        <h2 style={{width: '100%'}}>Micro-Jira</h2>
        <Button variant="tertiary" fullWidth onClick={() => setBoardCategoryEditorOpen(true)}>
          Add Board Category
        </Button>
        <Button variant="tertiary" fullWidth onClick={() => setBoardEditorOpen(true)}>
          Add Board
        </Button>
        <CategoriesList>
          <TreeItem
            label="Wszystkie tablice"
            onHeaderClick={() => {}}
          >
            <BoardsList>
              {boards.map((board) => (
                <div key={board.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BoardLink to={`/board/${board.id}`}>{board.name}</BoardLink>
                  <IconButton
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteBoard(board);
                    }}
                    aria-label="Usuń tablicę"
                  >
                    <TrashIcon />
                  </IconButton>
                </div>
              ))}
            </BoardsList>
          </TreeItem>
          {boardCategoryTree.map((node) => (
            <BoardCategoryTreeItem
              key={node.id}
              node={node}
              boardsByCategory={boardsByCategory}
              onDeleteCategory={setDeleteBoardCategory}
              onDeleteBoard={setDeleteBoard}
            />
          ))}
        </CategoriesList>
        <BoardCategoryEditorModal
          isOpen={boardCategoryEditorOpen}
          onClose={() => setBoardCategoryEditorOpen(false)}
          onSuccess={() => {
            setBoardCategoryEditorOpen(false);
            refreshBoardCategories();
          }}
        />
        <BoardEditorModal
          isOpen={boardEditorOpen}
          onClose={() => setBoardEditorOpen(false)}
          onSuccess={() => {
            setBoardEditorOpen(false);
            refreshBoardCategories();
            refreshBoards();
          }}
        />
        <ConfirmDialog
          isOpen={!!deleteBoardCategory}
          onConfirm={handleDeleteBoardCategory}
          onCancel={() => !deleteBoardCategoryLoading && setDeleteBoardCategory(null)}
          title="Usuń kategorię tablic"
          message={
            deleteBoardCategory
              ? `Czy na pewno chcesz usunąć kategorię „${deleteBoardCategory.name}"?`
              : ""
          }
          confirmText="Usuń"
          cancelText="Anuluj"
          variant="danger"
          loading={deleteBoardCategoryLoading}
        />
        <ConfirmDialog
          isOpen={!!deleteBoard}
          onConfirm={handleDeleteBoard}
          onCancel={() => !deleteBoardLoading && setDeleteBoard(null)}
          title="Usuń tablicę"
          message={
            deleteBoard
              ? `Czy na pewno chcesz usunąć tablicę „${deleteBoard.name}"? Wszystkie zadania zostaną usunięte.`
              : ""
          }
          confirmText="Usuń"
          cancelText="Anuluj"
          variant="danger"
          loading={deleteBoardLoading}
        />
      </SidebarActionsWrapper>
      <SidebarActionsWrapper flex>
        <h2 style={{ width: '100%' }}>Archiwum</h2>
        <CategoriesList>
          {archivedBoards.length === 0 ? (
            <div style={{ padding: '4px 0', fontSize: 13, color: 'var(--colors-textSecondary)' }}>
              Brak zarchiwizowanych tablic
            </div>
          ) : (
            <BoardsList>
              {archivedBoards.map((board) => (
                <BoardLink key={board.id} to={`/board/${board.id}`}>
                  {board.name}
                </BoardLink>
              ))}
            </BoardsList>
          )}
        </CategoriesList>
      </SidebarActionsWrapper>
    </>
  );
};

export default SidebarActions;
