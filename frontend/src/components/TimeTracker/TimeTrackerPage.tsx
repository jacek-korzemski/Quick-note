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
  background: ${({ theme }) => theme.colors.backgroundAlt};
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
  background: ${({ theme, $isOver }) =>
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
  entry: ReturnType<typeof useTimeTracker>['entries'][number];
  top: number;
  height: number;
  onEdit: () => void;
}

const DraggableTimeEntry: React.FC<DraggableTimeEntryProps> = ({ entry, top, height, onEdit }) => {
  const id = `time-entry-${entry.id}`;
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
      style={{ top, height, ...style }}
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
    const map: Record<number, typeof entries> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    entries.forEach((entry) => {
      const start = new Date(entry.start_datetime.replace(' ', 'T'));
      const index = start.getDay() - 1; // 0=Mon
      if (index >= 0 && index < 5) {
        map[index].push(entry);
      }
    });
    return map;
  }, [entries]);

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
    const entryId = Number(activeIdStr.replace(/^time-entry-/, ''));
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
            <DayHeader />
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
                {entriesByDay[dayIndex]?.map((entry) => {
                  const start = new Date(entry.start_datetime.replace(' ', 'T'));
                  const end = new Date(entry.end_datetime.replace(' ', 'T'));
                  const startMinutes = start.getHours() * 60 + start.getMinutes();
                  const fromStart = startMinutes - START_HOUR * 60;
                  const topSlots = fromStart / 30;
                  const heightSlots = (end.getTime() - start.getTime()) / (30 * 60 * 1000);
                  const top = topSlots * SLOT_HEIGHT;
                  const height = heightSlots * SLOT_HEIGHT;
                  return (
                    <DraggableTimeEntry
                      key={entry.id}
                      entry={entry}
                      top={top}
                      height={height}
                      onEdit={() => handleOpenEdit(entry.task_id)}
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
        maxWidth={480}
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

