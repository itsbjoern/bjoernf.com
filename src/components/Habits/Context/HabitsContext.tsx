import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { useToast } from '../Toasts';
import { DEFAULT_COLOR } from '../util';
import { API_HABITS_URL } from '@/utils/api';

export type Habit = {
  id: string;
  trackerId: string;
  name: string;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: string;
};

type HabitsState = {
  // Auth state
  isAuthenticated: boolean;
  trackerId: string | null;
  color: string;

  // Habit state
  habits: Habit[];
  completions: Map<string, Set<string>>; // date -> Set of habitIds

  // UI state
  selectedDate: Date;
  isLoading: boolean;
  currentView: 'auth' | 'tracker' | 'settings';
};

type HabitsActions = {
  // Auth actions
  login: (password: string) => Promise<void>;
  createTracker: (password: string, color: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;

  // Habit actions
  fetchHabits: () => Promise<void>;
  createHabit: (name: string, description: string) => Promise<void>;
  updateHabit: (id: string, updates: { name?: string; description?: string }) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Completion actions
  fetchCompletions: (year: number) => Promise<void>;
  toggleCompletion: (habitId: string, date: string) => Promise<void>;

  // Settings actions
  updateColor: (color: string) => Promise<void>;

  // UI actions
  setCurrentView: Dispatch<SetStateAction<'auth' | 'tracker' | 'settings'>>;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
};

const HabitsContext = createContext<(HabitsState & HabitsActions) | null>(null);

export const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const { addToast } = useToast();

  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trackerId, setTrackerId] = useState<string | null>(null);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Map<string, Set<string>>>(new Map());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'auth' | 'tracker' | 'settings'>('auth');

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Auth actions
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(API_HABITS_URL + '/session', {
        credentials: 'include',
      });

      if (!response.ok) {
        // Session invalid
        setIsAuthenticated(false);
        setCurrentView('auth');
        setTrackerId(null);
        return;
      }

      const data = await response.json();
      setIsAuthenticated(true);
      setCurrentView('tracker');
      setTrackerId(data.trackerId);
      setColor(data.color);

      // Fetch habits and completions
      await Promise.all([fetchHabits(), fetchCompletions(new Date().getFullYear())]);
    } catch (error) {
      console.error('Error checking session:', error);
      setIsAuthenticated(false);
      setCurrentView('auth');
    }
  }, []);

  const createTracker = useCallback(
    async (password: string, color: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(API_HABITS_URL + '/create-tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, color }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create tracker');
        }

        const data = await response.json();
        setTrackerId(data.trackerId);
        setColor(data.color);
        setIsAuthenticated(true);
        setCurrentView('tracker');

        addToast({ message: 'Tracker created successfully!', color: 'bg-green-600' });
      } catch (error) {
        console.error('Error creating tracker:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to create tracker',
          color: 'bg-red-600',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  const login = useCallback(
    async (password: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(API_HABITS_URL + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to log in');
        }

        const data = await response.json();
        setTrackerId(data.trackerId);
        setColor(data.color);
        setIsAuthenticated(true);
        setCurrentView('tracker');

        // Fetch habits and completions
        await Promise.all([fetchHabits(), fetchCompletions(new Date().getFullYear())]);
      } catch (error) {
        console.error('Error logging in:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to log in',
          color: 'bg-red-600',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  const logout = useCallback(async () => {
    try {
      await fetch(API_HABITS_URL + '/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setIsAuthenticated(false);
      setCurrentView('auth');
      setTrackerId(null);
      setHabits([]);
      setCompletions(new Map());
    } catch (error) {
      console.error('Error logging out:', error);
      addToast({ message: 'Failed to log out', color: 'bg-red-600' });
    }
  }, [addToast]);

  // Habit actions
  const fetchHabits = useCallback(async () => {
    try {
      const response = await fetch(API_HABITS_URL + '/list', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch habits');
      }

      const data = await response.json();
      setHabits(data.habits);
    } catch (error) {
      console.error('Error fetching habits:', error);
      addToast({ message: 'Failed to fetch habits', color: 'bg-red-600' });
    }
  }, [addToast]);

  const createHabit = useCallback(
    async (name: string, description: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(API_HABITS_URL + '/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create habit');
        }

        const data = await response.json();
        setHabits((prev) => [...prev, data.habit]);

        addToast({ message: 'Habit created!', color: 'bg-green-600' });
      } catch (error) {
        console.error('Error creating habit:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to create habit',
          color: 'bg-red-600',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  const updateHabit = useCallback(
    async (id: string, updates: { name?: string; description?: string }) => {
      setIsLoading(true);
      try {
        const response = await fetch(API_HABITS_URL + '/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habitId: id, ...updates }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update habit');
        }

        const data = await response.json();
        setHabits((prev) => prev.map((h) => (h.id === id ? data.habit : h)));

        addToast({ message: 'Habit updated!', color: 'bg-green-600' });
      } catch (error) {
        console.error('Error updating habit:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to update habit',
          color: 'bg-red-600',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(API_HABITS_URL + '/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habitId: id }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete habit');
        }

        setHabits((prev) => prev.filter((h) => h.id !== id));

        addToast({ message: 'Habit deleted', color: 'bg-gray-600' });
      } catch (error) {
        console.error('Error deleting habit:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to delete habit',
          color: 'bg-red-600',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  // Completion actions
  const fetchCompletions = useCallback(
    async (year: number) => {
      try {
        const response = await fetch(API_HABITS_URL + `/completions?year=${year}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch completions');
        }

        const data = await response.json();

        // Convert to Map structure
        const completionsMap = new Map<string, Set<string>>();
        for (const { date, habitIds } of data.completions) {
          completionsMap.set(date, new Set(habitIds));
        }

        setCompletions(completionsMap);
      } catch (error) {
        console.error('Error fetching completions:', error);
        addToast({ message: 'Failed to fetch completions', color: 'bg-red-600' });
      }
    },
    [addToast]
  );

  const toggleCompletion = useCallback(
    async (habitId: string, date: string) => {
      // Optimistic update
      setCompletions((prev) => {
        const newMap = new Map(prev);
        const habitIds = newMap.get(date) || new Set();
        const newHabitIds = new Set(habitIds);

        if (newHabitIds.has(habitId)) {
          newHabitIds.delete(habitId);
        } else {
          newHabitIds.add(habitId);
        }

        if (newHabitIds.size === 0) {
          newMap.delete(date);
        } else {
          newMap.set(date, newHabitIds);
        }

        return newMap;
      });

      try {
        const isCompleted = completions.get(date)?.has(habitId);

        if (isCompleted) {
          // Uncomplete
          const response = await fetch(API_HABITS_URL + '/uncomplete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ habitId, date }),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to uncomplete habit');
          }
        } else {
          // Complete
          const response = await fetch(API_HABITS_URL + '/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ habitId, date }),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to complete habit');
          }
        }
      } catch (error) {
        console.error('Error toggling completion:', error);
        // Revert optimistic update
        await fetchCompletions(new Date(date).getFullYear());
        addToast({ message: 'Failed to update completion', color: 'bg-red-600' });
      }
    },
    [completions, addToast, fetchCompletions]
  );

  const updateColor = useCallback(
    async (color: string) => {
      try {
        const response = await fetch(API_HABITS_URL + '/update-settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ color }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update color');
        }

        setColor(color);
        addToast({ message: 'Color updated!', color: 'bg-green-600' });
      } catch (error) {
        console.error('Error updating color:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to update color',
          color: 'bg-red-600',
        });
        throw error;
      }
    },
    [addToast]
  );

  const value = {
    // State
    isAuthenticated,
    trackerId,
    color,
    habits,
    completions,
    selectedDate,
    isLoading,
    currentView,
    // Actions
    login,
    createTracker,
    logout,
    checkSession,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    fetchCompletions,
    toggleCompletion,
    updateColor,
    setSelectedDate,
    setCurrentView,
  };

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
};

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within HabitsProvider');
  }
  return context;
};
