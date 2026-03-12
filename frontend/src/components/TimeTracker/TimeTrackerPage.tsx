import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTimeTracker } from '@/context/TimeTrackerContext';
import Modal from '@/components/Modal/Modal';
import { Button } from '@/components/Button/Button';
import Input from '@/components/Form/Input';
import Textarea from '@/components/Form/Textarea';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const SLOTS_PER_HOUR = 2;
const START_HOUR = 9;
const END_HOUR = 17;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;
const SLOT_HEIGHT = 32;

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const GridWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 60px repeat(5, 1fr);
  max-height: calc(100vh - 120px);
`;

const TimeColumn = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
`;

const TimeSlotLabel = styled.div`
  height: 32px;
  padding: 2px 4px;
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
`;

const DayColumn = styled.div`
  position: relative;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

const DayHeader = styled.div`
  padding: 6px 8px;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DayGrid = styled.div`
  position: relative;
  padding-top: 0;
  cursor: pointer;
`;

const HourLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  opacity: 0.4;
`;

const EntryBlock = styled.div<{ $isDragging?: boolean; $isOver?: boolean }>`
  position: absolute;
  left: 4px;
  right: 4px;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: ${({ theme }) => theme.fontSize.xs};
  background: ${({ $isOver }) =>
    $isOver ? 'rgba(80, 120, 255, 0.28)' : 'rgba(80, 120, 255, 0.18)'};
  border: 1px solid
    ${({ $isDragging }) => ($isDragging ? 'rgba(80, 120, 255, 0.4)' : 'rgba(80, 120, 255, 0.8)')};
  overflow: hidden;
`;

const SlotDropZone = styled.div<{ $isOver?: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  height: ${SLOT_HEIGHT}px;
  pointer-events: none;
  background: ${({ theme, $isOver }) => ($isOver ? theme.colors.surfaceHover : 'transparent')};
  opacity: ${({ $isOver }) => ($isOver ? 0.4 : 0)};
  transition: background 0.1s, opacity 0.1s;
`;

const InfoText = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ModalFooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ModalFooterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ModalFormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const startStr = weekStart.toLocaleDateString(undefined, opts);
  const endStr = end.toLocaleDateString(undefined, opts);
  return `${startStr} – ${endStr}`;
}

const dayLabels = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'];

const DroppableSlot: React.FC<{ dayIndex: number; slotIndex: number }> = ({ dayIndex, slotIndex }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${dayIndex}-${slotIndex}`,
  });
  return (
    <SlotDropZone
      ref={setNodeRef}
      $isOver={isOver}
      style={{ top: slotIndex * SLOT_HEIGHT, pointerEvents: 'auto' }}
    />
  );
};

interface DraggableTimeEntryProps {
  blockId: string;
  entry: ReturnType<typeof useTimeTracker>['entries'][number];
  top: number;
  height: number;
  leftPercent: number;
  widthPercent: number;
  onEdit: () => void;
}

const DraggableTimeEntry: React.FC<DraggableTimeEntryProps> = ({
  blockId,
  entry,
  top,
  height,
  leftPercent,
  widthPercent,
  onEdit,
}) => {
  const id = blockId;
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id,
    data: { entry },
  });
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id });
  const setNodeRef = (el: HTMLDivElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const start = new Date(entry.start_datetime.replace(' ', 'T'));
  const end = new Date(entry.end_datetime.replace(' ', 'T'));

  return (
    <EntryBlock
      ref={setNodeRef}
      style={{
        top,
        height,
        left: `calc(${leftPercent}% + 4px)`,
        width: `calc(${widthPercent}% - 8px)`,
        ...style,
      }}
      $isDragging={isDragging}
      $isOver={isOver}
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      {...listeners}
      {...attributes}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{entry.title}</div>
      <div>
        {start.toTimeString().slice(0, 5)} – {end.toTimeString().slice(0, 5)}
      </div>
    </EntryBlock>
  );
};

const TimeTrackerPage: React.FC = () => {
  const { currentWeekStart, entries, loading, error, setWeekStart, createTask, updateTask, deleteTask } =
    useTimeTracker();
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingComment, setEditingComment] = useState('');
  const [editingDurationHours, setEditingDurationHours] = useState(1);

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const handleThisWeek = () => {
    setWeekStart(new Date());
  };

  const entriesByDay = useMemo(() => {
    type ParsedEntry = {
      entry: (typeof entries)[number];
      start: Date;
      end: Date;
    };
    type TaskInterval = {
      taskId: number;
      start: Date;
      end: Date;
    };
    type DayEntry = {
      entry: (typeof entries)[number];
      top: number;
      height: number;
      leftPercent: number;
      widthPercent: number;
      blockId: string;
    };

    const map: Record<number, DayEntry[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    const parsed: ParsedEntry[] = entries
      .map((entry) => ({
        entry,
        start: new Date(entry.start_datetime.replace(' ', 'T')),
        end: new Date(entry.end_datetime.replace(' ', 'T')),
      }))
      .filter(({ start, end }) => end > start);

    const mergedByTask = new Map<number, TaskInterval[]>();
    parsed.forEach((item) => {
      const taskId = item.entry.task_id;
      const current = mergedByTask.get(taskId) ?? [];
      current.push({ taskId, start: item.start, end: item.end });
      mergedByTask.set(taskId, current);
    });

    const taskIntervals: TaskInterval[] = [];
    mergedByTask.forEach((intervals, taskId) => {
      const sorted = intervals
        .slice()
        .sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());
      const merged: TaskInterval[] = [];
      sorted.forEach((interval) => {
        const last = merged[merged.length - 1];
        if (!last || interval.start > last.end) {
          merged.push({ taskId, start: interval.start, end: interval.end });
          return;
        }
        if (interval.end > last.end) {
          last.end = interval.end;
        }
      });
      taskIntervals.push(...merged);
    });

    const intervalsByTask = new Map<number, TaskInterval[]>();
    taskIntervals.forEach((interval) => {
      const current = intervalsByTask.get(interval.taskId) ?? [];
      current.push(interval);
      intervalsByTask.set(interval.taskId, current);
    });

    const tasks = Array.from(intervalsByTask.keys());
    const taskOverlaps = (taskA: number, taskB: number) => {
      const aIntervals = intervalsByTask.get(taskA) ?? [];
      const bIntervals = intervalsByTask.get(taskB) ?? [];
      for (const a of aIntervals) {
        for (const b of bIntervals) {
          if (a.start < b.end && b.start < a.end) return true;
        }
      }
      return false;
    };

    const adjacency = new Map<number, number[]>();
    tasks.forEach((taskId) => adjacency.set(taskId, []));
    for (let i = 0; i < tasks.length; i += 1) {
      for (let j = i + 1; j < tasks.length; j += 1) {
        if (!taskOverlaps(tasks[i], tasks[j])) continue;
        adjacency.get(tasks[i])?.push(tasks[j]);
        adjacency.get(tasks[j])?.push(tasks[i]);
      }
    }

    const taskBounds = new Map<number, { startMs: number; endMs: number }>();
    intervalsByTask.forEach((intervals, taskId) => {
      const startMs = Math.min(...intervals.map((interval) => interval.start.getTime()));
      const endMs = Math.max(...intervals.map((interval) => interval.end.getTime()));
      taskBounds.set(taskId, { startMs, endMs });
    });

    const visited = new Set<number>();
    const layoutByTaskId = new Map<number, { column: number; columnsCount: number }>();

    tasks.forEach((taskId) => {
      if (visited.has(taskId)) return;
      const componentTaskIds: number[] = [];
      const stack = [taskId];
      visited.add(taskId);
      while (stack.length > 0) {
        const currentId = stack.pop();
        if (currentId == null) continue;
        componentTaskIds.push(currentId);
        const neighbors = adjacency.get(currentId) ?? [];
        neighbors.forEach((neighborId) => {
          if (visited.has(neighborId)) return;
          visited.add(neighborId);
          stack.push(neighborId);
        });
      }

      const componentEntries = componentTaskIds
        .map((id) => {
          const bounds = taskBounds.get(id);
          if (!bounds) return null;
          return { taskId: id, startMs: bounds.startMs, endMs: bounds.endMs };
        })
        .filter((item): item is { taskId: number; startMs: number; endMs: number } => Boolean(item))
        .sort((a, b) => a.startMs - b.startMs || b.endMs - a.endMs || a.taskId - b.taskId);

      const assignment = new Map<number, number>();
      const active: Array<{ endMs: number; column: number }> = [];
      let maxColumns = 1;

      componentEntries.forEach((item) => {
        for (let i = active.length - 1; i >= 0; i -= 1) {
          if (active[i].endMs <= item.startMs) {
            active.splice(i, 1);
          }
        }

        const usedColumns = new Set(active.map((a) => a.column));
        let column = 0;
        while (usedColumns.has(column)) {
          column += 1;
        }

        assignment.set(item.taskId, column);
        active.push({ endMs: item.endMs, column });
        if (active.length > maxColumns) {
          maxColumns = active.length;
        }
      });

      componentTaskIds.forEach((id) => {
        layoutByTaskId.set(id, {
          column: assignment.get(id) ?? 0,
          columnsCount: maxColumns,
        });
      });
    });

    for (let dayIndex = 0; dayIndex < 5; dayIndex += 1) {
      const dayStart = new Date(currentWeekStart);
      dayStart.setDate(dayStart.getDate() + dayIndex);
      dayStart.setHours(START_HOUR, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(END_HOUR, 0, 0, 0);

      parsed.forEach((item) => {
        if (item.end <= dayStart || item.start >= dayEnd) return;

        const visibleStart = item.start > dayStart ? item.start : dayStart;
        const visibleEnd = item.end < dayEnd ? item.end : dayEnd;
        if (visibleEnd <= visibleStart) return;

        const topMinutes = (visibleStart.getTime() - dayStart.getTime()) / (60 * 1000);
        const heightMinutes = (visibleEnd.getTime() - visibleStart.getTime()) / (60 * 1000);
        const layout = layoutByTaskId.get(item.entry.task_id) ?? { column: 0, columnsCount: 1 };

        map[dayIndex].push({
          entry: item.entry,
          top: (topMinutes / 30) * SLOT_HEIGHT,
          height: (heightMinutes / 30) * SLOT_HEIGHT,
          leftPercent: (layout.column / layout.columnsCount) * 100,
          widthPercent: 100 / layout.columnsCount,
          blockId: `time-entry-${item.entry.id}-${dayIndex}`,
        });
      });
    }

    return map;
  }, [entries, currentWeekStart]);

  const handleOpenEdit = (taskId: number) => {
    const taskEntries = entries.filter((e) => e.task_id === taskId);
    if (taskEntries.length === 0) return;
    const any = taskEntries[0];
    setEditingTaskId(taskId);
    setEditingTitle(any.title);
    setEditingDescription(any.description ?? '');
    setEditingComment(any.comment ?? '');
    setEditingDurationHours(any.duration_minutes / 60);
  };

  const handleCloseEdit = () => {
    setEditingTaskId(null);
  };

  const handleSaveEdit = async () => {
    if (editingTaskId == null) return;
    const durationMinutes = Math.round(editingDurationHours * 60);
    await updateTask(editingTaskId, {
      title: editingTitle,
      description: editingDescription,
      comment: editingComment,
      durationMinutes,
    });
    setEditingTaskId(null);
  };

  const handleDeleteTask = async () => {
    if (editingTaskId == null) return;
    await deleteTask(editingTaskId);
    setEditingTaskId(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    if (!activeIdStr.startsWith('time-entry-')) return;
    const entryMatch = activeIdStr.match(/^time-entry-(\d+)(?:-\d+)?$/);
    if (!entryMatch) return;
    const entryId = Number(entryMatch[1]);
    if (Number.isNaN(entryId)) return;

    const activeEntry = entries.find((e) => e.id === entryId);
    if (!activeEntry) return;

    const overIdStr = String(over.id);
    if (!overIdStr.startsWith('slot-')) return;
    const [, dayIndexStr, slotIndexStr] = overIdStr.split('-');
    const dayIndex = Number(dayIndexStr);
    const slotIndex = Number(slotIndexStr);
    if (Number.isNaN(dayIndex) || Number.isNaN(slotIndex)) return;

    const minutesFromStart = slotIndex * 30;
    const hour = START_HOUR + Math.floor(minutesFromStart / 60);
    const minute = minutesFromStart % 60;

    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayIndex);

    const start = new Date(date);
    start.setHours(hour, minute, 0, 0);

    await updateTask(activeEntry.task_id, {
      durationMinutes: activeEntry.duration_minutes,
      start,
    });
  };

  return (
    <Wrapper>
      <HeaderRow>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Time Tracker – tydzień</div>
          <InfoText>{formatWeekRange(currentWeekStart)}</InfoText>
        </div>
        <NavButtons>
          <Button variant="secondary" onClick={handlePrevWeek}>
            Poprzedni tydzień
          </Button>
          <Button variant="secondary" onClick={handleThisWeek}>
            Ten tydzień
          </Button>
          <Button variant="secondary" onClick={handleNextWeek}>
            Następny tydzień
          </Button>
        </NavButtons>
      </HeaderRow>

      {error && <InfoText>{error}</InfoText>}
      {loading && <InfoText>Ładowanie wpisów czasu…</InfoText>}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <GridWrapper>
          <TimeColumn>
            <DayHeader>-</DayHeader>
            {Array.from({ length: TOTAL_SLOTS }).map((_, idx) => {
              const hour = START_HOUR + Math.floor(idx / SLOTS_PER_HOUR);
              const minute = idx % SLOTS_PER_HOUR === 0 ? '00' : '30';
              return (
                <TimeSlotLabel key={idx}>
                  {minute === '00' ? `${hour.toString().padStart(2, '0')}:00` : ''}
                </TimeSlotLabel>
              );
            })}
          </TimeColumn>
          {dayLabels.map((label, dayIndex) => (
            <DayColumn key={label}>
              <DayHeader>{label}</DayHeader>
              <DayGrid
                style={{ height: TOTAL_SLOTS * SLOT_HEIGHT, position: 'relative' }}
                onClick={async (e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const slotIndex = Math.floor(y / SLOT_HEIGHT);
                  const minutesFromStart = slotIndex * 30;
                  const hour = START_HOUR + Math.floor(minutesFromStart / 60);
                  const minute = minutesFromStart % 60;

                  const date = new Date(currentWeekStart);
                  date.setDate(date.getDate() + dayIndex);

                  // Minimalne zadanie 30 min
                  await createTask({
                    title: 'Nowe zadanie',
                    date,
                    hour,
                    minute,
                    durationMinutes: 30,
                  });
                }}
              >
                {Array.from({ length: TOTAL_SLOTS }).map((_, slotIndex) => (
                  <DroppableSlot key={slotIndex} dayIndex={dayIndex} slotIndex={slotIndex} />
                ))}
                {Array.from({ length: END_HOUR - START_HOUR - 1 }).map((_, hourIdx) => (
                  <HourLine
                    key={hourIdx}
                    style={{ top: (hourIdx + 1) * SLOTS_PER_HOUR * SLOT_HEIGHT }}
                  />
                ))}
                {entriesByDay[dayIndex]?.map((entryPlacement) => {
                  return (
                    <DraggableTimeEntry
                      key={entryPlacement.blockId}
                      blockId={entryPlacement.blockId}
                      entry={entryPlacement.entry}
                      top={entryPlacement.top}
                      height={entryPlacement.height}
                      leftPercent={entryPlacement.leftPercent}
                      widthPercent={entryPlacement.widthPercent}
                      onEdit={() => handleOpenEdit(entryPlacement.entry.task_id)}
                    />
                  );
                })}
              </DayGrid>
            </DayColumn>
          ))}
        </GridWrapper>
      </DndContext>

      <Modal
        isOpen={editingTaskId != null}
        onClose={handleCloseEdit}
        title="Edycja zadania czasu"
        variant="center"
        maxWidth="480px"
        footer={
          <ModalFooterRow>
            <Button variant="danger" onClick={handleDeleteTask}>
              Usuń zadanie
            </Button>
            <ModalFooterActions>
              <Button variant="ghost" onClick={handleCloseEdit}>
                Anuluj
              </Button>
              <Button variant="primary" onClick={handleSaveEdit}>
                Zapisz
              </Button>
            </ModalFooterActions>
          </ModalFooterRow>
        }
      >
        <ModalFormBody>
          <Input
            label="Nazwa zadania"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            fullWidth
          />
          <Textarea
            label="Opis"
            value={editingDescription}
            onChange={(e) => setEditingDescription(e.target.value)}
            fullWidth
            rows={3}
          />
          <Textarea
            label="Komentarz"
            value={editingComment}
            onChange={(e) => setEditingComment(e.target.value)}
            fullWidth
            rows={3}
          />
          <Input
            label="Łączny czas trwania (h)"
            type="number"
            min={0.5}
            step={0.5}
            value={editingDurationHours}
            onChange={(e) => setEditingDurationHours(Number(e.target.value) || 0.5)}
            fullWidth
          />
        </ModalFormBody>
      </Modal>
    </Wrapper>
  );
};

export default TimeTrackerPage;

