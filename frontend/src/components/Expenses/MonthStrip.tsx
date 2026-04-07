import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { expensesApi, type MonthStripEntry } from '@/api/expenses';
import { useAuth } from '@/context/AuthContext';

const MONTH_NAMES_SHORT = [
  'Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
  'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru',
];

const CARD_WIDTH = 116;
const CARD_GAP = 6;
const RANGE_HALF = 12;

function formatMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function shiftMonthStr(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return formatMonth(d);
}

function parseMonthLabel(month: string): { short: string; year: string } {
  const [y, m] = month.split('-').map(Number);
  return { short: MONTH_NAMES_SHORT[m - 1], year: String(y) };
}

// --- Styled ---

const StripOuter = styled.div<{ $open: boolean }>`
  max-height: ${({ $open }) => ($open ? '140px' : '0px')};
  overflow: hidden;
  transition: max-height 300ms cubic-bezier(0.4, 0, 0.2, 1);
`;

const StripTrack = styled.div<{ $grabbing: boolean }>`
  display: flex;
  gap: ${CARD_GAP}px;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.xs}`};
  overflow-x: hidden;
  cursor: ${({ $grabbing }) => ($grabbing ? 'grabbing' : 'grab')};
  user-select: none;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const Card = styled.div<{ $active: boolean; $hasData: boolean }>`
  flex-shrink: 0;
  width: ${CARD_WIDTH}px;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1.5px solid ${({ theme, $active }) => ($active ? theme.colors.borderFocus : 'transparent')};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceActive : theme.colors.surface};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast},
              border-color ${({ theme }) => theme.transitions.fast},
              transform ${({ theme }) => theme.transitions.fast};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  opacity: ${({ $hasData, $active }) => ($active || $hasData ? 1 : 0.55)};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    transform: translateY(-1px);
  }
`;

const CardMonth = styled.span<{ $active: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme, $active }) => ($active ? theme.fontWeight.bold : theme.fontWeight.semibold)};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textLight)};
`;

const CardYear = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1;
`;

const CardStat = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-variant-numeric: tabular-nums;
`;

const CardAmount = styled.span<{ $active: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme, $active }) => ($active ? theme.colors.textLight : theme.colors.text)};
  font-variant-numeric: tabular-nums;
`;

// --- Component ---

interface MonthStripProps {
  open: boolean;
  currentMonth: string;
  onSelectMonth: (month: string) => void;
  refreshKey: number;
}

export default function MonthStrip({ open, currentMonth, onSelectMonth, refreshKey }: MonthStripProps) {
  const { user } = useAuth();
  const trackRef = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<MonthStripEntry[]>([]);
  const [rangeFrom, setRangeFrom] = useState(() => shiftMonthStr(currentMonth, -RANGE_HALF));
  const [rangeTo, setRangeTo] = useState(() => shiftMonthStr(currentMonth, RANGE_HALF));

  // drag-scroll state
  const dragging = useRef(false);
  const [grabbing, setGrabbing] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });
  const didDrag = useRef(false);

  const load = useCallback(async (from: string, to: string) => {
    if (!user) return;
    try {
      const { months } = await expensesApi.getStrip(from, to);
      setEntries(months);
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    load(rangeFrom, rangeTo);
  }, [rangeFrom, rangeTo, load, refreshKey]);

  // scroll to active month on mount / month change
  useEffect(() => {
    if (!trackRef.current || !entries.length) return;
    const idx = entries.findIndex((e) => e.month === currentMonth);
    if (idx < 0) return;
    const target = idx * (CARD_WIDTH + CARD_GAP) - trackRef.current.clientWidth / 2 + CARD_WIDTH / 2;
    trackRef.current.scrollTo({ left: target, behavior: 'smooth' });
  }, [currentMonth, entries]);

  // expand range when scrolling near edges
  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || !entries.length) return;
    const threshold = CARD_WIDTH * 2;
    if (el.scrollLeft < threshold) {
      const newFrom = shiftMonthStr(rangeFrom, -6);
      setRangeFrom(newFrom);
    }
    if (el.scrollWidth - el.scrollLeft - el.clientWidth < threshold) {
      const newTo = shiftMonthStr(rangeTo, 6);
      setRangeTo(newTo);
    }
  }, [entries, rangeFrom, rangeTo]);

  // --- drag scroll handlers ---
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    didDrag.current = false;
    setGrabbing(true);
    dragStart.current = { x: e.clientX, scrollLeft: trackRef.current?.scrollLeft ?? 0 };
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !trackRef.current) return;
      const dx = e.clientX - dragStart.current.x;
      if (Math.abs(dx) > 4) didDrag.current = true;
      trackRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
    };
    const onMouseUp = () => {
      dragging.current = false;
      setGrabbing(false);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleCardClick = useCallback((month: string) => {
    if (didDrag.current) return;
    onSelectMonth(month);
  }, [onSelectMonth]);

  return (
    <StripOuter $open={open}>
      <StripTrack
        ref={trackRef}
        $grabbing={grabbing}
        onMouseDown={onMouseDown}
        onScroll={handleScroll}
      >
        {entries.map((entry) => {
          const { short, year } = parseMonthLabel(entry.month);
          const active = entry.month === currentMonth;
          return (
            <Card
              key={entry.month}
              $active={active}
              $hasData={entry.items_count > 0}
              onClick={() => handleCardClick(entry.month)}
            >
              <CardMonth $active={active}>{short}</CardMonth>
              <CardYear>{year}</CardYear>
              <CardStat>{entry.items_count} poz.</CardStat>
              <CardAmount $active={active}>{entry.total_amount.toFixed(2)} zł</CardAmount>
            </Card>
          );
        })}
      </StripTrack>
    </StripOuter>
  );
}
