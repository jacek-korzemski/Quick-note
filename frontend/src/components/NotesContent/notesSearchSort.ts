import type { Category } from '@/api/categories';
import type { Note, NoteLabel } from '@/api/notes';

export type SortOption =
  | 'title_asc'
  | 'title_desc'
  | 'date_asc'
  | 'date_desc'
  | 'label_red_first'
  | 'label_green_first'
  | 'user_order';

const LABEL_ORDER_RED_FIRST: NoteLabel[] = ['error', 'warning', 'info', 'none', 'success'];
const LABEL_ORDER_GREEN_FIRST: NoteLabel[] = [...LABEL_ORDER_RED_FIRST].reverse();

const LABEL_NAMES_PL: Record<NoteLabel, string> = {
  none: 'brak',
  info: 'info',
  warning: 'ostrzeżenie',
  error: 'błąd',
  success: 'sukces',
};

function formatDateForSearch(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getCategoryPath(categoryId: number | null, categories: Category[]): string {
  if (categoryId == null) return '';
  const map = new Map(categories.map((c) => [c.id, c]));
  const parts: string[] = [];
  let current: Category | undefined = map.get(categoryId);
  while (current) {
    parts.unshift(current.name);
    current = current.parent_id != null ? map.get(current.parent_id) : undefined;
  }
  return parts.join('/');
}

export function matchesSearch(
  note: Note,
  query: string,
  getPath: (categoryId: number | null, categories: Category[]) => string,
  categories: Category[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const title = note.title.toLowerCase();
  const content = (note.content ?? '').toLowerCase();
  const createdStr = formatDateForSearch(note.created_at).toLowerCase();
  const updatedStr = formatDateForSearch(note.updated_at).toLowerCase();
  const labelName = LABEL_NAMES_PL[note.label].toLowerCase();
  const categoryPath = getPath(note.category_id, categories).toLowerCase();

  return (
    title.includes(q) ||
    content.includes(q) ||
    createdStr.includes(q) ||
    updatedStr.includes(q) ||
    labelName.includes(q) ||
    categoryPath.includes(q)
  );
}

export function sortNotes(notes: Note[], sortOption: SortOption): Note[] {
  const sorted = [...notes];

  switch (sortOption) {
    case 'title_asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'pl'));
    case 'title_desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title, 'pl'));
    case 'date_asc':
      return sorted.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case 'date_desc':
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case 'label_red_first': {
      const order = LABEL_ORDER_RED_FIRST;
      return sorted.sort(
        (a, b) => order.indexOf(a.label) - order.indexOf(b.label)
      );
    }
    case 'label_green_first': {
      const order = LABEL_ORDER_GREEN_FIRST;
      return sorted.sort(
        (a, b) => order.indexOf(a.label) - order.indexOf(b.label)
      );
    }
    case 'user_order':
      return sorted.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    default:
      return sorted;
  }
}

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'title_asc', label: 'Tytuł A–Z' },
  { value: 'title_desc', label: 'Tytuł Z–A' },
  { value: 'date_asc', label: 'Data od najstarszych' },
  { value: 'date_desc', label: 'Data od najnowszych' },
  { value: 'label_red_first', label: 'Oznaczenie od czerwonych' },
  { value: 'label_green_first', label: 'Oznaczenie od zielonych' },
  { value: 'user_order', label: 'Kolejność użytkownika' },
];
