import { useEffect, useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { useHabits } from '../Context/HabitsContext';

export const SettingsScreen = () => {
  const {
    color,
    updateColor,
    setCurrentView,
    inactiveHabits,
    fetchInactiveHabits,
    restoreHabit,
    deleteHabit,
  } = useHabits();

  useEffect(() => {
    fetchInactiveHabits();
  }, [fetchInactiveHabits]);

  const handleRestore = async (habitId: string) => {
    try {
      await restoreHabit(habitId);
    } catch (error) {
      console.error('Error restoring habit:', error);
    }
  };

  const handlePermanentDelete = async (habitId: string) => {
    try {
      if (confirm('Are you sure you want to permanently delete this habit? This action cannot be undone.')) {
        await deleteHabit(habitId);
      }
    } catch (error) {
      console.error('Error permanently deleting habit:', error);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Settings</h2>
        <ColorPicker selectedColor={color} setSelectedColor={updateColor} />
      </div>

      {inactiveHabits.length > 0 && (
        <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Inactive Habits
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            These habits have been deleted but can be restored or permanently removed.
          </p>
          <div className="space-y-3">
            {inactiveHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-md"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</h3>
                  {habit.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {habit.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleRestore(habit.id)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(habit.id)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-red-600 dark:text-red-400 rounded-md transition-colors"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <button
          onClick={() => setCurrentView('tracker')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
        >
          Back to Tracker
        </button>
      </div>
    </div>
  );
};
