import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import type { Article } from '@/api/articles';
import { Button } from '@/components/Button/Button';
import { useAuth } from '@/context/AuthContext';

type EditorTheme = 'dark' | 'light';
type BlockType = 'P' | 'H1' | 'H2' | 'H3';
const DEFAULT_EDITOR_THEME: EditorTheme = 'dark';

interface SimpleWYSIWYGProps {
  article: Article;
  onSave: (draft: { title: string; content_html: string; locked: boolean }) => Promise<void>;
  className?: string;
}

interface ToolbarState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  blockType: BlockType;
  fontSize: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TitleInput = styled.input<{ $locked: boolean }>`
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $locked }) => ($locked ? theme.colors.secondary : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

const HeaderTag = styled.span<{ $locked?: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $locked }) =>
    $locked ? theme.colors.surfaceActive : theme.colors.secondary};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const Toolbar = styled.div<{ $disabled: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.65;
      pointer-events: none;
    `}
`;

const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding-right: ${({ theme }) => theme.spacing.sm};
  margin-right: ${({ theme }) => theme.spacing.xs};
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-right: none;
    padding-right: 0;
    margin-right: 0;
  }
`;

const ToolButton = styled.button<{ $active?: boolean }>`
  min-width: 28px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceActive : theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const ToolSelect = styled.select`
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.sm};
  padding: 0 8px;
  min-width: 92px;
`;

const EditorArea = styled.div<{ $themeMode: EditorTheme }>`
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: ${({ theme, $themeMode }) =>
    $themeMode === 'dark' ? theme.colors.background : '#f6f6f6'};
  padding: ${({ theme }) => theme.spacing.md};
`;

const Editable = styled.div<{ $themeMode: EditorTheme; $locked: boolean }>`
  max-width: 980px;
  margin: 0 auto;
  min-height: 100%;
  padding: 20px 24px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $themeMode }) =>
    $themeMode === 'dark' ? theme.colors.surface : '#ffffff'};
  color: ${({ theme, $themeMode }) => ($themeMode === 'dark' ? theme.colors.text : '#1b1b1b')};
  line-height: 1.6;
  outline: none;
  cursor: ${({ $locked }) => ($locked ? 'not-allowed' : 'text')};

  &[data-placeholder]:empty::before {
    content: attr(data-placeholder);
    color: ${({ theme }) => theme.colors.textSecondary};
    pointer-events: none;
  }

  p {
    margin: 0 0 10px;
  }

  h1,
  h2,
  h3 {
    margin: 16px 0 10px;
    line-height: 1.3;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
  }

  td,
  th {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 6px 8px;
    vertical-align: top;
    min-width: 56px;
    min-height: 34px;
    height: 34px;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const FooterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
`;

const ModalPanel = styled.div`
  width: 360px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
`;

const ModalTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSize.lg};
`;

const ModalRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const ModalInput = styled.input`
  width: 90px;
  height: 30px;
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const filenameSafe = (value: string): string => {
  const compact = value.trim().replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
  return compact || 'article';
};

const sanitizeHtml = (html: string): string => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  const stripNode = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const attrs = Array.from(element.attributes);
      for (const attr of attrs) {
        const keep = attr.name === 'colspan' || attr.name === 'rowspan';
        if (!keep) {
          element.removeAttribute(attr.name);
        }
      }
    }
    for (const child of Array.from(node.childNodes)) {
      stripNode(child);
    }
  };

  stripNode(wrapper);
  return wrapper.innerHTML;
};

const htmlToMarkdown = (html: string): string => {
  let md = html;
  md = md.replace(/<\/?(strong|b)>/gi, '**');
  md = md.replace(/<\/?(em|i)>/gi, '*');
  md = md.replace(/<\/?u>/gi, '__');
  md = md.replace(/<\/?(s|strike)>/gi, '~~');
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<\/?(?:table|thead|tbody)>/gi, '');
  md = md.replace(/<tr[^>]*>/gi, '').replace(/<\/tr>/gi, '\n');
  md = md.replace(/<th[^>]*>(.*?)<\/th>/gi, '| $1 ');
  md = md.replace(/<td[^>]*>(.*?)<\/td>/gi, '| $1 ');
  md = md.replace(/<\/?[^>]+>/g, '');
  return md.trim();
};

const getThemeStorageKey = (userId: number | null): string =>
  userId ? `article_editor_theme_user_${userId}` : 'article_editor_theme_guest';

const loadPersistedTheme = (userId: number | null): EditorTheme => {
  const raw = localStorage.getItem(getThemeStorageKey(userId));
  return raw === 'light' ? 'light' : DEFAULT_EDITOR_THEME;
};

const getClosestCell = (node: Node | null): HTMLTableCellElement | null => {
  if (!node) return null;
  if (node instanceof HTMLTableCellElement) return node;
  if (node instanceof HTMLElement) {
    const cell = node.closest('td, th');
    return cell instanceof HTMLTableCellElement ? cell : null;
  }
  if (node.parentElement) {
    const cell = node.parentElement.closest('td, th');
    return cell instanceof HTMLTableCellElement ? cell : null;
  }
  return null;
};

const placeCaretAtCellStart = (cell: HTMLTableCellElement): void => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(cell);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

const SimpleWYSIWYG: React.FC<SimpleWYSIWYGProps> = ({ article, onSave, className }) => {
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<string>(article.content_html ?? '');
  const [title, setTitle] = useState(article.title);
  const [themeMode, setThemeMode] = useState<EditorTheme>(() => loadPersistedTheme(user?.id ?? null));
  const [locked, setLocked] = useState<boolean>(Boolean(article.locked_at));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    blockType: 'P',
    fontSize: '3',
  });
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);

  useLayoutEffect(() => {
    contentRef.current = article.content_html ?? '';
    setTitle(article.title);
    setLocked(Boolean(article.locked_at));
    setSaving(false);
    setDirty(false);
    if (editorRef.current) {
      editorRef.current.innerHTML = article.content_html || '';
    }
  }, [article.id, article.content_html, article.locked_at, article.title]);

  useEffect(() => {
    const persisted = loadPersistedTheme(user?.id ?? null);
    setThemeMode((prev) => (prev === persisted ? prev : persisted));
  }, [user?.id]);

  const updateToolbarState = useCallback(() => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    const selectedNode = selection?.anchorNode ?? null;
    const selectionInsideEditor =
      !!selection &&
      !!editor &&
      !!selectedNode &&
      (selectedNode === editor ||
        (selectedNode.nodeType === Node.ELEMENT_NODE && editor.contains(selectedNode as Element)) ||
        (selectedNode.nodeType === Node.TEXT_NODE && editor.contains(selectedNode.parentElement)));

    if (!selectionInsideEditor) {
      setToolbarState((prev) => ({
        ...prev,
        blockType: 'P',
        fontSize: '3',
      }));
      return;
    }

    const rawBlock = String(document.queryCommandValue('formatBlock') || '').replace(/[<>]/g, '').toUpperCase();
    const blockType: BlockType =
      rawBlock === 'H1' || rawBlock === 'H2' || rawBlock === 'H3' || rawBlock === 'P' ? rawBlock : 'P';
    const rawFont = String(document.queryCommandValue('fontSize') || '').trim();
    const fontSize = ['1', '2', '3', '4', '5', '6', '7'].includes(rawFont) ? rawFont : '3';

    setToolbarState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      blockType,
      fontSize,
    });
  }, []);

  useEffect(() => {
    const listener = () => updateToolbarState();
    document.addEventListener('selectionchange', listener);
    return () => document.removeEventListener('selectionchange', listener);
  }, [updateToolbarState]);

  const execute = useCallback(
    (command: string, value?: string) => {
      if (locked) return;
      editorRef.current?.focus();
      document.execCommand('styleWithCSS', false, 'false');
      document.execCommand(command, false, value ?? '');
      if (editorRef.current) {
        contentRef.current = editorRef.current.innerHTML;
      }
      setDirty(true);
      updateToolbarState();
    },
    [locked, updateToolbarState]
  );

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim() || 'Bez tytulu',
        content_html: sanitizeHtml(contentRef.current),
        locked,
      });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [locked, onSave, saving, title]);

  const handleExportHtml = useCallback(() => {
    const clean = sanitizeHtml(contentRef.current || '');
    const blob = new Blob(
      ['<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body>', clean, '</body></html>'],
      { type: 'text/html;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenameSafe(title)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [title]);

  const handleExportMarkdown = useCallback(() => {
    const markdown = htmlToMarkdown(contentRef.current || '');
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenameSafe(title)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [title]);

  const handleCopy = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (!editorRef.current) return;

    const commonNode = range.commonAncestorContainer;
    const insideEditor =
      commonNode === editorRef.current ||
      (commonNode.nodeType === Node.ELEMENT_NODE &&
        editorRef.current.contains(commonNode as HTMLElement)) ||
      (commonNode.nodeType === Node.TEXT_NODE &&
        editorRef.current.contains(commonNode.parentElement));
    if (!insideEditor) return;

    const fragment = range.cloneContents();
    const container = document.createElement('div');
    container.appendChild(fragment);
    const html = sanitizeHtml(container.innerHTML);
    const plain = selection.toString();

    event.preventDefault();
    event.clipboardData.setData('text/html', html);
    event.clipboardData.setData('text/plain', plain);
  }, []);

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      if (locked) {
        event.preventDefault();
        return;
      }

      const html = event.clipboardData.getData('text/html');
      const text = event.clipboardData.getData('text/plain');
      event.preventDefault();
      if (html) {
        execute('insertHTML', sanitizeHtml(html));
      } else if (text) {
        execute('insertText', text);
      }
    },
    [execute, locked]
  );

  const insertTable = useCallback(() => {
    if (locked) return;
    const rows = Math.max(1, Math.min(20, tableRows));
    const cols = Math.max(1, Math.min(10, tableCols));
    const rowHtml = `<tr>${'<td></td>'.repeat(cols)}</tr>`;
    execute('insertHTML', `<table>${rowHtml.repeat(rows)}</table><p></p>`);
    setShowTableModal(false);
  }, [execute, locked, tableCols, tableRows]);

  const lockLabel = useMemo(() => (locked ? 'Odblokuj' : 'Zablokuj'), [locked]);
  const statusLabel = useMemo(() => (locked ? 'Klodka: zamknieta' : 'Klodka: otwarta'), [locked]);

  return (
    <Wrapper className={className}>
      <Header>
        <TitleInput
          $locked={locked}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
          }}
          placeholder="Tytul artykulu"
          disabled={locked}
        />
        <Button
          variant={locked ? 'secondary' : 'tertiary'}
          size="sm"
          onClick={() => {
            setLocked((prev) => !prev);
            setDirty(true);
          }}
        >
          {lockLabel}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            setThemeMode((prev) => {
              const next: EditorTheme = prev === 'dark' ? 'light' : 'dark';
              localStorage.setItem(getThemeStorageKey(user?.id ?? null), next);
              return next;
            })
          }
        >
          Motyw: {themeMode === 'dark' ? 'Dark' : 'Light'}
        </Button>
      </Header>

      <Toolbar $disabled={locked}>
        <ToolbarGroup>
          <ToolButton type="button" title="Pogrubienie" $active={toolbarState.bold} onClick={() => execute('bold')}>
            B
          </ToolButton>
          <ToolButton type="button" title="Pochylenie" $active={toolbarState.italic} onClick={() => execute('italic')}>
            I
          </ToolButton>
          <ToolButton
            type="button"
            title="Podkreslenie"
            $active={toolbarState.underline}
            onClick={() => execute('underline')}
          >
            U
          </ToolButton>
          <ToolButton
            type="button"
            title="Przekreslenie"
            $active={toolbarState.strikeThrough}
            onClick={() => execute('strikeThrough')}
          >
            S
          </ToolButton>
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolSelect
            aria-label="Naglowek"
            value={toolbarState.blockType}
            onChange={(e) => {
              const value = e.target.value as BlockType;
              execute('formatBlock', value);
            }}
          >
            <option value="P">Akapit</option>
            <option value="H1">H1</option>
            <option value="H2">H2</option>
            <option value="H3">H3</option>
          </ToolSelect>
          <ToolSelect
            aria-label="Rozmiar fontu"
            value={toolbarState.fontSize}
            onChange={(e) => {
              const value = e.target.value;
              execute('fontSize', value);
            }}
          >
            <option value="1">XS</option>
            <option value="2">S</option>
            <option value="3">M</option>
            <option value="4">L</option>
            <option value="5">XL</option>
            <option value="6">XXL</option>
            <option value="7">XXXL</option>
          </ToolSelect>
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolButton type="button" title="Do lewej" onClick={() => execute('justifyLeft')}>
            L
          </ToolButton>
          <ToolButton type="button" title="Do srodka" onClick={() => execute('justifyCenter')}>
            C
          </ToolButton>
          <ToolButton type="button" title="Do prawej" onClick={() => execute('justifyRight')}>
            R
          </ToolButton>
          <ToolButton type="button" title="Wyjustuj" onClick={() => execute('justifyFull')}>
            J
          </ToolButton>
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolButton type="button" title="Wstaw tabele" onClick={() => setShowTableModal(true)}>
            Tabela
          </ToolButton>
        </ToolbarGroup>
      </Toolbar>

      <EditorArea $themeMode={themeMode}>
        <Editable
          ref={editorRef}
          $themeMode={themeMode}
          $locked={locked}
          contentEditable={!locked}
          suppressContentEditableWarning
          data-placeholder="Wpisz tresc artykulu..."
          onInput={() => {
            if (editorRef.current) {
              contentRef.current = editorRef.current.innerHTML;
              setDirty(true);
            }
          }}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onMouseUp={updateToolbarState}
          onKeyUp={updateToolbarState}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              const selection = window.getSelection();
              const currentCell = getClosestCell(selection?.anchorNode ?? null);
              const currentRow = currentCell?.parentElement;
              const table = currentRow?.parentElement;

              if (
                currentCell &&
                currentRow instanceof HTMLTableRowElement &&
                table &&
                (table instanceof HTMLTableSectionElement || table instanceof HTMLTableElement)
              ) {
                const cellsInRow = Array.from(currentRow.cells);
                const columnIndex = cellsInRow.indexOf(currentCell);
                if (columnIndex >= 0) {
                  const targetRow =
                    e.key === 'ArrowUp'
                      ? (currentRow.previousElementSibling as HTMLTableRowElement | null)
                      : (currentRow.nextElementSibling as HTMLTableRowElement | null);
                  if (targetRow instanceof HTMLTableRowElement) {
                    const targetCell = targetRow.cells.item(
                      Math.min(columnIndex, Math.max(0, targetRow.cells.length - 1))
                    );
                    if (targetCell) {
                      e.preventDefault();
                      placeCaretAtCellStart(targetCell);
                      updateToolbarState();
                      return;
                    }
                  }
                }
              }
            }

            if (!(e.ctrlKey || e.metaKey)) return;
            const key = e.key.toLowerCase();
            if (key === 'b') {
              e.preventDefault();
              execute('bold');
            } else if (key === 'i') {
              e.preventDefault();
              execute('italic');
            } else if (key === 'u') {
              e.preventDefault();
              execute('underline');
            }
          }}
        />
      </EditorArea>

      <Footer>
        <FooterGroup>
          <HeaderTag $locked={locked}>{statusLabel}</HeaderTag>
        </FooterGroup>
        <FooterGroup>
          <Button variant="secondary" size="sm" onClick={handleExportHtml}>
            Eksport .html
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportMarkdown}>
            Eksport .md
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving} disabled={!dirty}>
            Zapisz
          </Button>
        </FooterGroup>
      </Footer>

      {showTableModal && (
        <ModalBackdrop onClick={() => setShowTableModal(false)}>
          <ModalPanel onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Wstaw tabele</ModalTitle>
            <ModalRow>
              Wiersze
              <ModalInput
                type="number"
                min={1}
                max={20}
                value={tableRows}
                onChange={(e) => setTableRows(Number(e.target.value) || 1)}
              />
            </ModalRow>
            <ModalRow>
              Kolumny
              <ModalInput
                type="number"
                min={1}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(Number(e.target.value) || 1)}
              />
            </ModalRow>
            <ModalActions>
              <Button variant="secondary" size="sm" onClick={() => setShowTableModal(false)}>
                Anuluj
              </Button>
              <Button variant="primary" size="sm" onClick={insertTable}>
                Wstaw
              </Button>
            </ModalActions>
          </ModalPanel>
        </ModalBackdrop>
      )}
    </Wrapper>
  );
};

export default SimpleWYSIWYG;
