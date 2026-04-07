import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useExpenses } from '@/context/ExpensesContext';
import type { ExpenseCategory, ExpenseItem as ExpenseItemType } from '@/api/expenses';
import Modal from '@/components/Modal/Modal';
import ConfirmDialog from '@/components/Modal/ConfirmDialog';
import { Button } from '@/components/Button/Button';
import Input from '@/components/Form/Input';
import Textarea from '@/components/Form/Textarea';
import { Select } from '@/components/Form/Select';
import MonthStrip from './MonthStrip';

const COLOR_OPTIONS = [
  { value: 'none', label: 'Domyślny' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'success', label: 'Success' },
];

const COLOR_MAP: Record<string, string> = {
  info: '#2196f3',
  warning: '#ff9800',
  error: '#f44336',
  success: '#4caf50',
  none: '#3c3c3c',
};

const COLOR_LABEL: Record<string, string> = {
  info: 'Info',
  warning: 'Warning',
  error: 'Error',
  success: 'Success',
  none: 'Domyślny',
};

function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const names = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
  ];
  return `${names[m - 1]} ${y}`;
}

function generateDayOptions(month: string) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));
}

// --- Styled Components ---

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-height: 100vh;
  overflow-y: auto;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  position: relative;
`;

const NavButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ToggleStripButton = styled.button<{ $open: boolean }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  z-index: 1;
  transition: color ${({ theme }) => theme.transitions.fast},
              background ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.textLight};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  svg {
    width: 14px;
    height: 14px;
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  }
`;

const MonthLabel = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.xxl};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textLight};
`;

const CategorySection = styled.div<{ $color: string; $isDragging?: boolean; $isOver?: boolean }>`
  border: 1px solid ${({ theme, $isOver }) => $isOver ? theme.colors.borderFocus : theme.colors.border};
  border-left: 4px solid ${({ $color }) => COLOR_MAP[$color] || COLOR_MAP.none};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
  opacity: ${({ $isDragging }) => $isDragging ? 0.6 : 1};
  transition: opacity ${({ theme }) => theme.transitions.fast},
              border-color ${({ theme }) => theme.transitions.fast};
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme }) => theme.colors.backgroundLighter};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CategoryHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const DragHandle = styled.span`
  cursor: grab;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  user-select: none;
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:active {
    cursor: grabbing;
  }
`;

const CategoryName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textLight};
`;

const CategoryActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    text-align: right;
    width: 120px;
  }
`;

const ThAmount = styled(Th)`
  text-align: right;
  width: 100px;
`;

const Td = styled.td`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: top;
`;

const TdAmount = styled(Td)`
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

const TdActions = styled(Td)`
  text-align: right;
  white-space: nowrap;
`;

const ItemNameButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 0;
  font-size: ${({ theme }) => theme.fontSize.md};
  text-align: left;

  &:hover {
    text-decoration: underline;
  }
`;

const DescriptionRow = styled.tr`
  td {
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm} ${theme.spacing.sm}`};
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    font-style: italic;
  }
`;

const CategoryFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundLighter};
`;

const SummaryBox = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`;

const SummaryTitle = styled.div`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textLight};
  background: ${({ theme }) => theme.colors.backgroundLighter};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SummaryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const SummaryTh = styled.th`
  text-align: left;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SummaryTd = styled.td`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-variant-numeric: tabular-nums;
`;

const SummaryTotalRow = styled.tr`
  font-weight: ${({ theme }) => theme.fontWeight.semibold};

  td {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const ColorDot = styled.span<{ $color: string }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  margin-right: ${({ theme }) => theme.spacing.xs};
  vertical-align: middle;
  position: relative;
  top: -2px;
`;

const AddButtonRow = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const InlineAction = styled.button`
  background: none;
  border: none;
  padding: 2px 6px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.textLight};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSize.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.md};
`;

// --- DnD wrappers ---

function DraggableCategory({
  cat,
  children,
}: {
  cat: ExpenseCategory;
  children: (props: { dragHandleProps: Record<string, unknown>; isDragging: boolean; isOver: boolean; setNodeRef: (el: HTMLDivElement | null) => void; style: React.CSSProperties | undefined }) => React.ReactNode;
}) {
  const id = `cat-${cat.id}`;
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({ id, data: { cat } });
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id });
  const setNodeRef = (el: HTMLDivElement | null) => { setDragRef(el); setDropRef(el); };
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  return <>{children({ dragHandleProps: { ...listeners, ...attributes }, isDragging, isOver, setNodeRef, style })}</>;
}

// --- Component ---

const ExpensesPage: React.FC = () => {
  const {
    currentMonth, categories, summary, loading, error,
    setMonth, goToPrevMonth, goToNextMonth, goToCurrentMonth,
    createCategory, updateCategory, deleteCategory, reorderCategories,
    createItem, updateItem, deleteItem,
  } = useExpenses();

  // Month strip
  const [isStripOpen, setIsStripOpen] = useState(true);
  const [stripRefreshKey, setStripRefreshKey] = useState(0);
  const bumpStrip = useCallback(() => setStripRefreshKey((k) => k + 1), []);

  // Category form
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ExpenseCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('none');
  const [catSaving, setCatSaving] = useState(false);

  // Item form
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItemType | null>(null);
  const [itemCategoryId, setItemCategoryId] = useState(0);
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemDay, setItemDay] = useState('1');
  const [itemAmount, setItemAmount] = useState('');
  const [itemSaving, setItemSaving] = useState(false);

  // Delete confirm
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Expanded descriptions
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || over.id === active.id) return;

    const activeId = Number(String(active.id).replace(/^cat-/, ''));
    const overId = Number(String(over.id).replace(/^cat-/, ''));
    if (isNaN(activeId) || isNaN(overId)) return;

    const currentOrder = categories.map((c) => c.id);
    const activeIdx = currentOrder.indexOf(activeId);
    const overIdx = currentOrder.indexOf(overId);
    if (activeIdx < 0 || overIdx < 0) return;

    const withoutActive = currentOrder.filter((id) => id !== activeId);
    const overIdxInNew = withoutActive.indexOf(overId);
    const insertAt = activeIdx < overIdx ? overIdxInNew + 1 : overIdxInNew;
    const newOrder = [...withoutActive];
    newOrder.splice(insertAt, 0, activeId);

    reorderCategories(newOrder);
  }, [categories, reorderCategories]);

  const dayOptions = useMemo(() => generateDayOptions(currentMonth), [currentMonth]);

  const toggleDescription = useCallback((id: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // --- Category modal ---

  const openNewCategoryModal = useCallback(() => {
    setEditingCat(null);
    setCatName('');
    setCatColor('none');
    setCatModalOpen(true);
  }, []);

  const openEditCategoryModal = useCallback((cat: ExpenseCategory) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatColor(cat.color);
    setCatModalOpen(true);
  }, []);

  const handleSaveCategory = useCallback(async () => {
    if (!catName.trim()) return;
    setCatSaving(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, { name: catName.trim(), color: catColor });
      } else {
        await createCategory({ name: catName.trim(), color: catColor });
      }
      setCatModalOpen(false);
      bumpStrip();
    } catch {
      // error handled by context
    } finally {
      setCatSaving(false);
    }
  }, [catName, catColor, editingCat, createCategory, updateCategory, bumpStrip]);

  // --- Item modal ---

  const openNewItemModal = useCallback((categoryId: number) => {
    setEditingItem(null);
    setItemCategoryId(categoryId);
    setItemName('');
    setItemDesc('');
    setItemDay('1');
    setItemAmount('');
    setItemModalOpen(true);
  }, []);

  const openEditItemModal = useCallback((item: ExpenseItemType) => {
    setEditingItem(item);
    setItemCategoryId(item.category_id);
    setItemName(item.name);
    setItemDesc(item.description);
    setItemDay(String(item.day));
    setItemAmount(String(item.amount));
    setItemModalOpen(true);
  }, []);

  const handleSaveItem = useCallback(async () => {
    const amount = parseFloat(itemAmount);
    if (!itemName.trim() || isNaN(amount) || amount <= 0) return;
    setItemSaving(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, {
          name: itemName.trim(),
          description: itemDesc,
          day: parseInt(itemDay, 10),
          amount,
        });
      } else {
        await createItem({
          category_id: itemCategoryId,
          name: itemName.trim(),
          description: itemDesc,
          day: parseInt(itemDay, 10),
          amount,
        });
      }
      setItemModalOpen(false);
      bumpStrip();
    } catch {
      // error handled by context
    } finally {
      setItemSaving(false);
    }
  }, [itemName, itemDesc, itemDay, itemAmount, itemCategoryId, editingItem, createItem, updateItem, bumpStrip]);

  // --- Delete handlers ---

  const handleDeleteCategory = useCallback(async () => {
    if (deleteCatId === null) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteCatId);
      setDeleteCatId(null);
      bumpStrip();
    } catch {
      // error
    } finally {
      setDeleting(false);
    }
  }, [deleteCatId, deleteCategory, bumpStrip]);

  const handleDeleteItem = useCallback(async () => {
    if (deleteItemId === null) return;
    setDeleting(true);
    try {
      await deleteItem(deleteItemId);
      setDeleteItemId(null);
      bumpStrip();
    } catch {
      // error
    } finally {
      setDeleting(false);
    }
  }, [deleteItemId, deleteItem, bumpStrip]);

  return (
    <Wrapper>
      {/* Header with month navigation */}
      <HeaderRow>
        <MonthLabel>{formatMonthLabel(currentMonth)}</MonthLabel>
        <ToggleStripButton
          $open={isStripOpen}
          onClick={() => setIsStripOpen((v) => !v)}
          title={isStripOpen ? 'Ukryj timeline' : 'Rozwiń timeline'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </ToggleStripButton>
        <NavButtons>
          <Button variant="secondary" size="sm" onClick={goToPrevMonth}>
            &#8592;
          </Button>
          <Button variant="secondary" size="sm" onClick={goToCurrentMonth}>
            Ten miesiąc
          </Button>
          <Button variant="secondary" size="sm" onClick={goToNextMonth}>
            &#8594;
          </Button>
        </NavButtons>
      </HeaderRow>

      {/* Month strip */}
      <MonthStrip
        open={isStripOpen}
        currentMonth={currentMonth}
        onSelectMonth={setMonth}
        refreshKey={stripRefreshKey}
      />

      {/* Add category button -- at the top */}
      {!loading && (
        <Button variant="secondary" size="sm" onClick={openNewCategoryModal}>
          + Dodaj kategorię
        </Button>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading && <EmptyState>Ładowanie...</EmptyState>}

      {!loading && categories.length === 0 && !error && (
        <EmptyState>Brak kategorii wydatków w tym miesiącu.</EmptyState>
      )}

      {/* Categories with DnD */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {categories.map((cat) => (
          <DraggableCategory key={cat.id} cat={cat}>
            {({ dragHandleProps, isDragging, isOver, setNodeRef, style }) => (
              <CategorySection
                ref={setNodeRef}
                style={style}
                $color={cat.color}
                $isDragging={isDragging}
                $isOver={isOver}
              >
                <CategoryHeader>
                  <CategoryHeaderLeft>
                    <DragHandle {...dragHandleProps}>⠿</DragHandle>
                    <CategoryName>
                      <ColorDot $color={COLOR_MAP[cat.color] || COLOR_MAP.none} />
                      {cat.name}
                    </CategoryName>
                  </CategoryHeaderLeft>
                  <CategoryActions>
                    <InlineAction onClick={() => openEditCategoryModal(cat)}>
                      Edytuj
                    </InlineAction>
                    {cat.items_count === 0 && (
                      <InlineAction onClick={() => setDeleteCatId(cat.id)}>
                        Usuń
                      </InlineAction>
                    )}
                  </CategoryActions>
                </CategoryHeader>

                {cat.items.length > 0 ? (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Nazwa</Th>
                        <Th>Dzień</Th>
                        <ThAmount>Kwota</ThAmount>
                        <Th>Akcje</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.items.map((item) => (
                        <>
                          <tr key={item.id}>
                            <Td>
                              <ItemNameButton
                                onClick={() => toggleDescription(item.id)}
                                title={item.description ? 'Kliknij aby zobaczyć opis' : undefined}
                              >
                                {item.name}
                                {item.description ? ' ▾' : ''}
                              </ItemNameButton>
                            </Td>
                            <Td>{item.day}</Td>
                            <TdAmount>{item.amount.toFixed(2)} zł</TdAmount>
                            <TdActions>
                              <InlineAction onClick={() => openEditItemModal(item)}>
                                Edytuj
                              </InlineAction>
                              <InlineAction onClick={() => setDeleteItemId(item.id)}>
                                Usuń
                              </InlineAction>
                            </TdActions>
                          </tr>
                          {expandedItems.has(item.id) && item.description && (
                            <DescriptionRow key={`desc-${item.id}`}>
                              <td colSpan={4}>{item.description}</td>
                            </DescriptionRow>
                          )}
                        </>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <EmptyState>Brak pozycji w tej kategorii.</EmptyState>
                )}

                <AddButtonRow>
                  <Button variant="ghost" size="sm" onClick={() => openNewItemModal(cat.id)}>
                    + Dodaj pozycję
                  </Button>
                </AddButtonRow>

                <CategoryFooter>
                  <span>Pozycji: {cat.items_count}</span>
                  <span>Suma: {cat.items_total.toFixed(2)} zł</span>
                </CategoryFooter>
              </CategorySection>
            )}
          </DraggableCategory>
        ))}
      </DndContext>

      {/* Global summary */}
      {!loading && categories.length > 0 && (
        <SummaryBox>
          <SummaryTitle>Podsumowanie</SummaryTitle>
          <SummaryTable>
            <thead>
              <tr>
                <SummaryTh>Kolor</SummaryTh>
                <SummaryTh style={{ textAlign: 'right' }}>Pozycji</SummaryTh>
                <SummaryTh style={{ textAlign: 'right' }}>Kwota</SummaryTh>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.by_color).map(([color, data]) => (
                <tr key={color}>
                  <SummaryTd>
                    <ColorDot $color={COLOR_MAP[color] || COLOR_MAP.none} />
                    {COLOR_LABEL[color] || color}
                  </SummaryTd>
                  <SummaryTd style={{ textAlign: 'right' }}>{data.count}</SummaryTd>
                  <SummaryTd style={{ textAlign: 'right' }}>{data.amount.toFixed(2)} zł</SummaryTd>
                </tr>
              ))}
              <SummaryTotalRow>
                <SummaryTd>Razem</SummaryTd>
                <SummaryTd style={{ textAlign: 'right' }}>{summary.total_items}</SummaryTd>
                <SummaryTd style={{ textAlign: 'right' }}>{summary.total_amount.toFixed(2)} zł</SummaryTd>
              </SummaryTotalRow>
            </tbody>
          </SummaryTable>
        </SummaryBox>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCat ? 'Edytuj kategorię' : 'Nowa kategoria'}
        variant="fit-content"
        width="400px"
        loading={catSaving}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCatModalOpen(false)} disabled={catSaving}>
              Anuluj
            </Button>
            <Button variant="primary" onClick={handleSaveCategory} loading={catSaving}>
              Zapisz
            </Button>
          </>
        }
      >
        <FormRow>
          <Input
            label="Nazwa"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            fullWidth
            autoFocus
          />
          <Select
            label="Kolor"
            options={COLOR_OPTIONS}
            value={catColor}
            onChange={(val) => setCatColor(val)}
            fullWidth
          />
        </FormRow>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? 'Edytuj pozycję' : 'Nowa pozycja'}
        variant="fit-content"
        width="420px"
        loading={itemSaving}
        footer={
          <>
            <Button variant="secondary" onClick={() => setItemModalOpen(false)} disabled={itemSaving}>
              Anuluj
            </Button>
            <Button variant="primary" onClick={handleSaveItem} loading={itemSaving}>
              Zapisz
            </Button>
          </>
        }
      >
        <FormRow>
          <Input
            label="Nazwa"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
            autoFocus
          />
          <Textarea
            label="Opis"
            value={itemDesc}
            onChange={(e) => setItemDesc(e.target.value)}
            fullWidth
            rows={3}
          />
          <Select
            label="Dzień"
            options={dayOptions}
            value={itemDay}
            onChange={(val) => setItemDay(val)}
            fullWidth
          />
          <Input
            label="Kwota (zł)"
            type="number"
            min="0.01"
            step="0.01"
            value={itemAmount}
            onChange={(e) => setItemAmount(e.target.value)}
            fullWidth
          />
        </FormRow>
      </Modal>

      {/* Confirm delete category */}
      <ConfirmDialog
        isOpen={deleteCatId !== null}
        onCancel={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCategory}
        title="Usuń kategorię"
        message="Czy na pewno chcesz usunąć tę kategorię? Zostanie ukryta od tego miesiąca."
        confirmText="Usuń"
        cancelText="Anuluj"
        variant="danger"
        loading={deleting}
      />

      {/* Confirm delete item */}
      <ConfirmDialog
        isOpen={deleteItemId !== null}
        onCancel={() => setDeleteItemId(null)}
        onConfirm={handleDeleteItem}
        title="Usuń pozycję"
        message="Czy na pewno chcesz usunąć tę pozycję wydatku?"
        confirmText="Usuń"
        cancelText="Anuluj"
        variant="danger"
        loading={deleting}
      />
    </Wrapper>
  );
};

export default ExpensesPage;
