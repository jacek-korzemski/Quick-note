import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { timeTrackerApi, type TimeEntry } from '@/api/timeTracker';
import { useAuth } from '@/context/AuthContext';

interface TimeTrackerContextType {
  currentWeekStart: Date;
  entries: TimeEntry[];
  loading: boolean;
  error: string | null;
  setWeekStart: (date: Date) => void;
  refreshWeek: () => Promise<void>;
  createTask: (input: {
    title: string;
    description?: string;
    date: Date;
    hour: number;
    minute: number;
    durationMinutes: number;
  }) => Promise<void>;
  updateTask: (taskId: number, data: { title?: string; description?: string; comment?: string; durationMinutes?: number; start?: Date }) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
}

const TimeTrackerContext = createContext<TimeTrackerContextType | null>(null);

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = niedziela, 1 = poniedziałek
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function TimeTrackerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeek = useCallback(
    async (weekStart: Date) => {
      if (!user) {
        setEntries([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const from = formatDateISO(weekStart);
        const { entries } = await timeTrackerApi.getWeek(from);
        setEntries(entries);
      } catch (e) {
        setEntries([]);
        setError(e instanceof Error ? e.message : 'Nie udało się pobrać wpisów czasu.');
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) {
      loadWeek(currentWeekStart);
    } else {
      setEntries([]);
    }
  }, [user, currentWeekStart, loadWeek]);

  const setWeekStart = useCallback((date: Date) => {
    setCurrentWeekStart(getMonday(date));
  }, []);

  const refreshWeek = useCallback(async () => {
    await loadWeek(currentWeekStart);
  }, [loadWeek, currentWeekStart]);

  const createTask = useCallback(
    async (input: {
      title: string;
      description?: string;
      date: Date;
      hour: number;
      minute: number;
      durationMinutes: number;
    }) => {
      const { title, description, date, hour, minute, durationMinutes } = input;
      const start = new Date(date);
      start.setHours(hour, minute, 0, 0);

      const y = start.getFullYear();
      const m = String(start.getMonth() + 1).padStart(2, '0');
      const d = String(start.getDate()).padStart(2, '0');
      const hh = String(start.getHours()).padStart(2, '0');
      const mm = String(start.getMinutes()).padStart(2, '0');
      const startStr = `${y}-${m}-${d} ${hh}:${mm}:00`;

      await timeTrackerApi.createTask({
        title,
        description,
        start_datetime: startStr,
        duration_minutes: durationMinutes,
      });
      await loadWeek(currentWeekStart);
    },
    [currentWeekStart, loadWeek]
  );

  const updateTask = useCallback(
    async (taskId: number, data: { title?: string; description?: string; comment?: string; durationMinutes?: number; start?: Date }) => {
      const payload: {
        title?: string;
        description?: string;
        comment?: string;
        duration_minutes?: number;
        start_datetime?: string;
      } = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.description !== undefined) payload.description = data.description;
      if (data.comment !== undefined) payload.comment = data.comment;
      if (data.durationMinutes !== undefined) payload.duration_minutes = data.durationMinutes;
      if (data.start) {
        const y = data.start.getFullYear();
        const m = String(data.start.getMonth() + 1).padStart(2, '0');
        const d = String(data.start.getDate()).padStart(2, '0');
        const hh = String(data.start.getHours()).padStart(2, '0');
        const mm = String(data.start.getMinutes()).padStart(2, '0');
        payload.start_datetime = `${y}-${m}-${d} ${hh}:${mm}:00`;
      }

      await timeTrackerApi.updateTask(taskId, payload);
      await loadWeek(currentWeekStart);
    },
    [currentWeekStart, loadWeek]
  );

  const deleteTask = useCallback(
    async (taskId: number) => {
      await timeTrackerApi.deleteTask(taskId);
      await loadWeek(currentWeekStart);
    },
    [currentWeekStart, loadWeek]
  );

  const value = useMemo<TimeTrackerContextType>(
    () => ({
      currentWeekStart,
      entries,
      loading,
      error,
      setWeekStart,
      refreshWeek,
      createTask,
      updateTask,
      deleteTask,
    }),
    [currentWeekStart, entries, loading, error, setWeekStart, refreshWeek, createTask, updateTask, deleteTask]
  );

  return <TimeTrackerContext.Provider value={value}>{children}</TimeTrackerContext.Provider>;
}

export function useTimeTracker() {
  const ctx = useContext(TimeTrackerContext);
  if (!ctx) {
    throw new Error('useTimeTracker must be used within a TimeTrackerProvider');
  }
  return ctx;
}

