import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotes } from "@/context/NotesContext";
import { useCategories } from "@/context/CategoriesContext";
import { useBoardCategories } from "@/context/BoardCategoriesContext";
import { useArticleCategories, type ArticleCategoryTreeNode } from "@/context/ArticleCategoriesContext";
import type { CategoryTreeNode } from "@/context/CategoriesContext";
import type { BoardCategoryTreeNode } from "@/api/boardCategories";
import { articlesApi, type Article } from "@/api/articles";
import NoteEditorModal from "@/components/NoteEditorModal/NoteEditorModal";
import CategoryEditorModal from "@/components/CategoryEditorModal/CategoryEditorModal";
import BoardCategoryEditorModal from "@/components/BoardCategoryEditorModal/BoardCategoryEditorModal";
import BoardEditorModal from "@/components/BoardEditorModal/BoardEditorModal";
import ArticleCategoryEditorModal from "@/components/ArticleCategoryEditorModal/ArticleCategoryEditorModal";
import ArticleEditorModal from "@/components/ArticleEditorModal/ArticleEditorModal";
import ConfirmDialog from "@/components/Modal/ConfirmDialog";
import TreeItem from "@/components/Collapsible/TreeItem";
import { IconButton } from "@/components/Box/styles";
import TrashIcon from "@/components/Icon/TrashIcon";
import { categoriesApi } from "@/api/categories";
import { boardCategoriesApi } from "@/api/boardCategories";
import { boardsApi, type Board } from "@/api/boards";
import styled, { css } from "styled-components";

/* ── Styled Components ─────────────────────────────────────── */

const SidebarSection = styled.div`
  padding: 8px 0;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 4px;
`;

const SectionLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
  user-select: none;
`;

const SectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SectionContent = styled.div`
  width: 100%;
`;

const BoardLink = styled(Link)<{ $selected?: boolean }>`
  display: block;
  padding: 6px 12px;
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  background: ${({ $selected, theme }) => 
    $selected ? theme.colors.surfaceActive : 'transparent'};

  ${({ $selected, theme }) =>
    $selected &&
    css`
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: ${theme.colors.primary};
      }
    `}

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
`;

const BoardsList = styled.div`
  padding-left: 8px;
`;

const ArticlesList = styled.div`
  padding-left: 8px;
`;

/* ── Icons ─────────────────────────────────────────────────── */

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

const NotePlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2H4.5A1.5 1.5 0 003 3.5v9A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V6L9 2z" />
    <path d="M9 2v4h4" />
    <path d="M8 8.5v3M6.5 10h3" />
  </svg>
);

const BoardPlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="12" height="10" rx="1.5" />
    <path d="M8 5.5v5M5.5 8h5" />
  </svg>
);

const ArticlePlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2.5h5l3 3V13a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 3 13V4a1.5 1.5 0 0 1 1-1.5z" />
    <path d="M9 2.5V6h3" />
    <path d="M8 8.5v3M6.5 10h3" />
  </svg>
);

/* ── Sub-components ────────────────────────────────────────── */

const CategoryTreeItem: React.FC<{
  node: CategoryTreeNode;
  selectedCategoryId: number | null;
  onSelect: (id: number) => void;
  onDelete: (node: CategoryTreeNode) => void;
  indent?: number;
  isActive: boolean;
}> = ({ node, selectedCategoryId, onSelect, onDelete, indent = 0, isActive }) => {
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
        selected={isActive && selectedCategoryId === node.id}
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
            isActive={isActive}
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
      selected={isActive && selectedCategoryId === node.id}
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
  activeBoardId: number | null;
}> = ({ node, boardsByCategory, onDeleteCategory, onDeleteBoard, indent = 0, activeBoardId }) => {
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
          <BoardLink to={`/board/${board.id}`} $selected={activeBoardId === board.id}>
            {board.name}
          </BoardLink>
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
          activeBoardId={activeBoardId}
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

const ArticleCategoryTreeItem: React.FC<{
  node: ArticleCategoryTreeNode;
  articlesByCategory: Record<number, Article[]>;
  onDeleteCategory: (node: ArticleCategoryTreeNode) => void;
  onDeleteArticle: (article: Article) => void;
  indent?: number;
  activeArticleId: number | null;
}> = ({ node, articlesByCategory, onDeleteCategory, onDeleteArticle, indent = 0, activeArticleId }) => {
  const articles = articlesByCategory[node.id] ?? [];
  const deleteAction = (
    <IconButton
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDeleteCategory(node);
      }}
      aria-label="Usuń kategorię artykułów"
    >
      <TrashIcon />
    </IconButton>
  );

  const content = (
    <>
      {articles.map((article) => (
        <div key={article.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BoardLink to={`/articles/${article.id}`} $selected={activeArticleId === article.id}>
            {article.title}
          </BoardLink>
          <IconButton
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDeleteArticle(article);
            }}
            aria-label="Usuń artykuł"
          >
            <TrashIcon />
          </IconButton>
        </div>
      ))}
      {node.children.map((child) => (
        <ArticleCategoryTreeItem
          key={child.id}
          node={child}
          articlesByCategory={articlesByCategory}
          onDeleteCategory={onDeleteCategory}
          onDeleteArticle={onDeleteArticle}
          indent={indent + 1}
          activeArticleId={activeArticleId}
        />
      ))}
    </>
  );

  if (node.children.length > 0 || articles.length > 0) {
    return (
      <TreeItem
        label={node.name}
        indent={indent}
        actions={deleteAction}
      >
        <ArticlesList>{content}</ArticlesList>
      </TreeItem>
    );
  }

  return (
    <TreeItem
      label={node.name}
      indent={indent}
      onClick={() => {}}
      actions={deleteAction}
    />
  );
};

/* ── Main Component ────────────────────────────────────────── */

const SidebarActions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { refreshNotes } = useNotes();
  const { tree, selectedCategoryId, setSelectedCategoryId, refreshCategories } = useCategories();
  const { tree: boardCategoryTree, refreshBoardCategories } = useBoardCategories();
  const {
    tree: articleCategoryTree,
    selectedArticleCategoryId,
    setSelectedArticleCategoryId,
    refreshArticleCategories,
  } = useArticleCategories();
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
  const [articleCategoryEditorOpen, setArticleCategoryEditorOpen] = useState(false);
  const [articleEditorOpen, setArticleEditorOpen] = useState(false);
  const [deleteArticleCategory, setDeleteArticleCategory] = useState<ArticleCategoryTreeNode | null>(null);
  const [deleteArticleCategoryLoading, setDeleteArticleCategoryLoading] = useState(false);
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);
  const [deleteArticleLoading, setDeleteArticleLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);

  const refreshArticles = useCallback(async () => {
    if (!user) return;
    try {
      const { articles: data } = await articlesApi.getAll();
      setArticles(data);
    } catch {
      setArticles([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) refreshArticles();
  }, [user, refreshArticles]);

  const activeBoardId = location.pathname.startsWith('/board/')
    ? Number(location.pathname.split('/')[2])
    : null;

  const activeArticleId = location.pathname.startsWith('/articles/')
    ? Number(location.pathname.split('/')[2])
    : null;

  const isNotesSectionActive = location.pathname === '/';
  const isTimeTrackerActive = location.pathname.startsWith('/time-tracker');

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
      // noop
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
      // noop
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
      // noop
    } finally {
      setDeleteBoardLoading(false);
    }
  };

  const handleNotesSelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    navigate('/');
  };

  const handleDeleteArticleCategoryConfirm = async () => {
    if (!deleteArticleCategory) return;
    setDeleteArticleCategoryLoading(true);
    try {
      const { articleCategoriesApi } = await import('@/api/articleCategories');
      await articleCategoriesApi.delete(deleteArticleCategory.id);
      if (selectedArticleCategoryId === deleteArticleCategory.id) {
        setSelectedArticleCategoryId(deleteArticleCategory.parent_id);
      }
      setDeleteArticleCategory(null);
      await Promise.all([refreshArticleCategories(), refreshArticles()]);
    } catch {
      // noop
    } finally {
      setDeleteArticleCategoryLoading(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!deleteArticle) return;
    setDeleteArticleLoading(true);
    try {
      await articlesApi.delete(deleteArticle.id);
      setDeleteArticle(null);
      refreshArticles();
      if (activeArticleId === deleteArticle.id) {
        navigate('/');
      }
    } catch {
      // noop
    } finally {
      setDeleteArticleLoading(false);
    }
  };

  const articlesByCategory: Record<number, Article[]> = articles.reduce<Record<number, Article[]>>(
    (acc, article) => {
      const key = article.article_category_id ?? 0;
      (acc[key] = acc[key] ?? []).push(article);
      return acc;
    },
    {}
  );

  if (!user) return null;

  return (
    <>
      <SidebarSection>
        <SectionHeader>
          <SectionLabel>Notatki</SectionLabel>
          <SectionActions>
            <AddButton title="Dodaj kategorię" onClick={() => setCategoryEditorOpen(true)}>
              <PlusIcon />
            </AddButton>
            <AddButton title="Nowa notatka" onClick={() => setEditorOpen(true)}>
              <NotePlusIcon />
            </AddButton>
          </SectionActions>
        </SectionHeader>
        <SectionContent>
          <TreeItem
            label="Wszystkie notatki"
            onClick={() => handleNotesSelect(null)}
            selected={isNotesSectionActive && selectedCategoryId === null}
          />
          {tree.map((node) => (
            <CategoryTreeItem
              key={node.id}
              node={node}
              selectedCategoryId={selectedCategoryId}
              onSelect={(id) => handleNotesSelect(id)}
              onDelete={setDeleteCategory}
              isActive={isNotesSectionActive}
            />
          ))}
        </SectionContent>
      </SidebarSection>

      <SidebarSection>
        <SectionHeader>
          <SectionLabel>Artykuły</SectionLabel>
          <SectionActions>
            <AddButton
              title="Dodaj kategorię artykułów"
              onClick={() => setArticleCategoryEditorOpen(true)}
            >
              <PlusIcon />
            </AddButton>
            <AddButton
              title="Utwórz artykuł"
              onClick={() => setArticleEditorOpen(true)}
            >
              <ArticlePlusIcon />
            </AddButton>
          </SectionActions>
        </SectionHeader>
        <SectionContent>
          <TreeItem label="Wszystkie artykuły" onHeaderClick={() => {}}>
            <ArticlesList>
              {articles.map((article) => (
                <div key={article.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BoardLink to={`/articles/${article.id}`} $selected={activeArticleId === article.id}>
                    {article.title}
                  </BoardLink>
                  <IconButton
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteArticle(article);
                    }}
                    aria-label="Usuń artykuł"
                  >
                    <TrashIcon />
                  </IconButton>
                </div>
              ))}
            </ArticlesList>
          </TreeItem>
          {articleCategoryTree.map((node) => (
            <ArticleCategoryTreeItem
              key={node.id}
              node={node}
              articlesByCategory={articlesByCategory}
              onDeleteCategory={setDeleteArticleCategory}
              onDeleteArticle={setDeleteArticle}
              activeArticleId={activeArticleId}
            />
          ))}
        </SectionContent>
      </SidebarSection>

      <SidebarSection>
        <SectionHeader>
          <SectionLabel>Tablice</SectionLabel>
          <SectionActions>
            <AddButton title="Dodaj kategorię tablic" onClick={() => setBoardCategoryEditorOpen(true)}>
              <PlusIcon />
            </AddButton>
            <AddButton title="Dodaj tablicę" onClick={() => setBoardEditorOpen(true)}>
              <BoardPlusIcon />
            </AddButton>
          </SectionActions>
        </SectionHeader>
        <SectionContent>
          <TreeItem label="Wszystkie tablice" onHeaderClick={() => {}}>
            <BoardsList>
              {boards.map((board) => (
                <div key={board.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BoardLink to={`/board/${board.id}`} $selected={activeBoardId === board.id}>
                    {board.name}
                  </BoardLink>
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
              activeBoardId={activeBoardId}
            />
          ))}
          <div style={{width: '100%', height: '1px', background: 'rgba(255,255,255,0.14)', margin: '6px 0'}}></div>
          <TreeItem
            label="Time Tracker"
            onClick={() => navigate('/time-tracker')}
            selected={isTimeTrackerActive}
          />
        </SectionContent>
      </SidebarSection>

      <SidebarSection>
        <SectionContent>
          {archivedBoards.length > 0 ? (
            <TreeItem
              label={`Archiwum (${archivedBoards.length})`}
              onHeaderClick={() => {}}
            >
              <BoardsList>
                {archivedBoards.map((board) => (
                  <BoardLink
                    key={board.id}
                    to={`/board/${board.id}`}
                    $selected={activeBoardId === board.id}
                  >
                    {board.name}
                  </BoardLink>
                ))}
              </BoardsList>
            </TreeItem>
          ) : (
            <TreeItem label="Archiwum" onClick={() => {}} />
          )}
        </SectionContent>
      </SidebarSection>

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
      <ArticleCategoryEditorModal
        isOpen={articleCategoryEditorOpen}
        onClose={() => setArticleCategoryEditorOpen(false)}
        onSuccess={() => {
          setArticleCategoryEditorOpen(false);
          refreshArticleCategories();
        }}
      />
      <ArticleEditorModal
        isOpen={articleEditorOpen}
        onClose={() => setArticleEditorOpen(false)}
        onSuccess={(articleId) => {
          setArticleEditorOpen(false);
          refreshArticles();
          navigate(`/articles/${articleId}`);
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
      <ConfirmDialog
        isOpen={!!deleteArticleCategory}
        onConfirm={handleDeleteArticleCategoryConfirm}
        onCancel={() => !deleteArticleCategoryLoading && setDeleteArticleCategory(null)}
        title="Usuń kategorię artykułów"
        message={
          deleteArticleCategory
            ? `Czy na pewno chcesz usunąć kategorię „${deleteArticleCategory.name}"? Artykuły z tej kategorii zostaną przeniesione do kategorii nadrzędnej (lub będą widoczne tylko w „Wszystkie artykuły", jeśli brak nadrzędnej).`
            : ""
        }
        confirmText="Usuń"
        cancelText="Anuluj"
        variant="danger"
        loading={deleteArticleCategoryLoading}
      />
      <ConfirmDialog
        isOpen={!!deleteArticle}
        onConfirm={handleDeleteArticle}
        onCancel={() => !deleteArticleLoading && setDeleteArticle(null)}
        title="Usuń artykuł"
        message={
          deleteArticle
            ? `Czy na pewno chcesz usunąć artykuł „${deleteArticle.title}"?`
            : ""
        }
        confirmText="Usuń"
        cancelText="Anuluj"
        variant="danger"
        loading={deleteArticleLoading}
      />
    </>
  );
};

export default SidebarActions;
