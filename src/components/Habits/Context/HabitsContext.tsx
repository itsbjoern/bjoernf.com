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
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
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
  isPublic: boolean;

  // Habit state
  habits: Habit[];
  inactiveHabits: Habit[];
  completions: Map<string, Set<string>>; // date -> Set of habitIds

  // UI state
  selectedDate: Date;
  isLoading: boolean;
  currentView: 'auth' | 'tracker' | 'settings';
};

type HabitsActions = {
  // Auth actions
  authenticate: () => Promise<void>;
  register: (color: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;

  // Habit actions
  fetchHabits: () => Promise<void>;
  fetchInactiveHabits: () => Promise<void>;
  createHabit: (name: string, description: string) => Promise<void>;
  updateHabit: (id: string, updates: { name?: string; description?: string }) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  restoreHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Completion actions
  fetchCompletions: (year: number) => Promise<void>;
  toggleCompletion: (habitId: string, date: string) => Promise<void>;

  // Settings actions
  updateColor: (color: string) => Promise<void>;
  updateIsPublic: (isPublic: boolean) => Promise<void>;

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
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [inactiveHabits, setInactiveHabits] = useState<Habit[]>([]);
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
      const response = await fetch(API_HABITS_URL + '/trackers/session', {
        headers: { 'Content-Type': 'application/json' },
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
      setIsPublic(data.isPublic || false);

      // Fetch habits and completions
      await Promise.all([fetchHabits(), fetchCompletions(new Date().getFullYear())]);
    } catch (error) {
      console.error('Error checking session:', error);
      setIsAuthenticated(false);
      setCurrentView('auth');
    }
  }, []);

  const register = useCallback(
    async (color: string) => {
      setIsLoading(true);
      try {
        // Get registration options from server
        const optionsResponse = await fetch(API_HABITS_URL + '/auth/register-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          credentials: 'include',
        });

        if (!optionsResponse.ok) {
          throw new Error('Failed to get registration options');
        }

        const options = await optionsResponse.json();

        // Start WebAuthn registration
        const credential = await startRegistration(options);

        // Send credential to server for verification
        const verifyResponse = await fetch(API_HABITS_URL + '/auth/register-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential, color }),
          credentials: 'include',
        });

        if (!verifyResponse.ok) {
          const error = await verifyResponse.json();
          throw new Error(error.error || 'Failed to register passkey');
        }

        const data = await verifyResponse.json();
        setTrackerId(data.trackerId);
        setColor(data.color);
        setIsPublic(data.isPublic || false);
        setIsAuthenticated(true);
        setCurrentView('tracker');

        addToast({ message: 'Passkey created successfully!', color: 'bg-green-600' });
      } catch (error) {
        console.error('Error registering passkey:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to create passkey',
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
      await fetch(API_HABITS_URL + '/trackers/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(API_HABITS_URL + '/habits?status=active', {
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
        const response = await fetch(API_HABITS_URL + '/habits', {
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
        const response = await fetch(API_HABITS_URL + `/habits/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
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

  const archiveHabit = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(API_HABITS_URL + `/habits/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete habit');
        }

        setHabits((prev) => prev.filter((h) => h.id !== id));

        addToast({ message: 'Habit archived', color: 'bg-gray-600' });
      } catch (error) {
        console.error('Error archiving habit:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to archiving habit',
          color: 'bg-red-600',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  const fetchInactiveHabits = useCallback(async () => {
    try {
      const response = await fetch(API_HABITS_URL + '/habits?status=inactive', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inactive habits');
      }

      const data = await response.json();
      setInactiveHabits(data.habits);
    } catch (error) {
      console.error('Error fetching inactive habits:', error);
      addToast({ message: 'Failed to fetch inactive habits', color: 'bg-red-600' });
    }
  }, [addToast]);

  const restoreHabit = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(API_HABITS_URL + `/habits/${id}/restore`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to restore habit');
        }

        const data = await response.json();

        // Remove from inactive habits
        setInactiveHabits((prev) => prev.filter((h) => h.id !== id));

        // Add to active habits
        setHabits((prev) => [...prev, data.habit]);

        addToast({ message: 'Habit restored!', color: 'bg-green-600' });
      } catch (error) {
        console.error('Error restoring habit:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to restore habit',
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
        const response = await fetch(API_HABITS_URL + `/habits/${id}/permanent`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to permanently delete habit');
        }

        setInactiveHabits((prev) => prev.filter((h) => h.id !== id));

        addToast({ message: 'Habit permanently deleted', color: 'bg-gray-600' });
      } catch (error) {
        console.error('Error permanently deleting habit:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to permanently delete habit',
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
          headers: { 'Content-Type': 'application/json' },
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
          const response = await fetch(API_HABITS_URL + '/completions', {
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
          const response = await fetch(API_HABITS_URL + '/completions', {
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


  const authenticate = useCallback(
    async () => {
      setIsLoading(true);
      try {
        // Get authentication options from server
        const optionsResponse = await fetch(API_HABITS_URL + '/auth/auth-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!optionsResponse.ok) {
          throw new Error('Failed to get authentication options');
        }

        const options = await optionsResponse.json();

        // Start WebAuthn authentication
        const credential = await startAuthentication(options);

        // Send credential to server for verification
        const verifyResponse = await fetch(API_HABITS_URL + '/auth/auth-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
          credentials: 'include',
        });

        if (!verifyResponse.ok) {
          const error = await verifyResponse.json();
          throw new Error(error.error || 'Failed to authenticate');
        }

        const data = await verifyResponse.json();
        setTrackerId(data.trackerId);
        setColor(data.color);
        setIsPublic(data.isPublic || false);
        setIsAuthenticated(true);
        setCurrentView('tracker');

        // Fetch habits and completions
        await Promise.all([fetchHabits(), fetchCompletions(new Date().getFullYear())]);

        addToast({ message: 'Authenticated successfully!', color: 'bg-green-600' });
      } catch (error) {
        console.error('Error authenticating:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to authenticate',
          color: 'bg-red-600',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, fetchHabits, fetchCompletions]
  );


  const updateColor = useCallback(
    async (color: string) => {
      try {
        const response = await fetch(API_HABITS_URL + '/trackers/settings', {
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

  const updateIsPublic = useCallback(
    async (isPublic: boolean) => {
      try {
        const response = await fetch(API_HABITS_URL + '/trackers/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublic }),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update public setting');
        }

        setIsPublic(isPublic);
        addToast({
          message: isPublic ? 'Tracker is now public' : 'Tracker is now private',
          color: 'bg-green-600',
        });
      } catch (error) {
        console.error('Error updating public setting:', error);
        addToast({
          message: error instanceof Error ? error.message : 'Failed to update public setting',
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
    isPublic,
    habits,
    inactiveHabits,
    completions,
    selectedDate,
    isLoading,
    currentView,
    // Actions
    authenticate,
    register,
    logout,
    checkSession,
    fetchHabits,
    fetchInactiveHabits,
    createHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    fetchCompletions,
    toggleCompletion,
    updateColor,
    updateIsPublic,
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
