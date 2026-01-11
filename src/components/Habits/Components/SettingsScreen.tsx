import { useEffect, useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { useHabits } from '../Context/HabitsContext';

export const SettingsScreen = () => {
  const {
    color,
    updateColor,
    isPublic,
    updateIsPublic,
    trackerId,
    setCurrentView,
    inactiveHabits,
    fetchInactiveHabits,
    restoreHabit,
    deleteHabit,
  } = useHabits();
  const [copied, setCopied] = useState(false);

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

  const handleTogglePublic = async () => {
    try {
      await updateIsPublic(!isPublic);
    } catch (error) {
      console.error('Error toggling public setting:', error);
    }
  };

  const copyEmbedLink = () => {
    const embedUrl = `${window.location.origin}/fun/habits/embed?tracker=${trackerId}`;
    navigator.clipboard.writeText(embedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Settings</h2>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</h3>
          <ColorPicker selectedColor={color} setSelectedColor={updateColor} />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Public Sharing</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Make your tracker public to embed it on your website. Only completion counts will be visible, not habit names.
          </p>

          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={handleTogglePublic}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {isPublic ? 'Public' : 'Private'}
            </span>
          </div>

          {isPublic && trackerId && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Embeddable URL:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/fun/habits/embed?tracker=${trackerId}`}
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 font-mono"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={copyEmbedLink}
                  className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Use this URL in an iframe to embed your tracker on your website.
              </p>
            </div>
          )}
        </div>
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
