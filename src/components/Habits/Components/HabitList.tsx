import { useState } from 'react';
import { useHabits } from '../Context/HabitsContext';
import { formatDate, formatDisplayDate } from '../util';

export const HabitList = () => {
  const { habits, completions, selectedDate, toggleCompletion, createHabit, updateHabit, deleteHabit } =
    useHabits();

  const [addForm, setAddForm] = useState<{ visible: boolean; id: string | null; name: string; description: string }>({ visible: false, id: null, name: '', description: '' });

  const dateStr = formatDate(selectedDate);
  const completedHabitIds = completions.get(dateStr) || new Set();

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;

    try {
      if (addForm.id) {
        await updateHabit(addForm.id, {
          name: addForm.name,
          description: addForm.description,
        });
      } else {
        await createHabit(addForm.name, addForm.description);
      }
      setAddForm({ visible: false, id: null, name: '', description: '' });
    } catch (err) {
      // Error shown via toast
    }
  };

  return (
    <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {formatDisplayDate(selectedDate)}
        </h2>
        <button
          onClick={() => setAddForm({ ...addForm, id: null, name: "", description: "", visible: !addForm.visible })}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm"
        >
          {addForm.visible ? 'Cancel' : '+ Add Habit'}
        </button>
      </div>

      {addForm.visible && (
        <form onSubmit={handleAddHabit} className="mb-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
          <input
            type="text"
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            placeholder="Habit name"
            className="w-full px-3 py-2 mb-2 border text-gray-900 dark:text-gray-100 bg-white dark:bg-black border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <input
            type="text"
            value={addForm.description}
            onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 mb-2 border text-gray-900 dark:text-gray-100 bg-white dark:bg-black border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
          >
            {addForm.id ? 'Update Habit' : 'Add Habit'}
          </button>
        </form>
      )}

      {habits.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-600 text-center py-8">No habits yet. Add your first habit!</p>
      ) : (
        <div className="space-y-1">
          {habits.map((habit) => {
            const isCompleted = completedHabitIds.has(habit.id);

            return (
              <div
                key={habit.id}
                className="flex gap-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md transition-colors group items-end md:items-start flex-col md:flex-row"
              >
                <div className="flex items-start sm:items-center flex-1 gap-3 w-full">
                  <input
                    id={`habit-checkbox-${habit.id}`}
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleCompletion(habit.id, dateStr)}
                    className="h-5 w-5 mt-0.5 sm:mt-0 sm:flex-col flex-shrink-0 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor={`habit-checkbox-${habit.id}`} className="flex-1 cursor-pointer min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</div>
                    {habit.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{habit.description}</div>
                    )}
                  </label>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      setAddForm({ visible: true, id: habit.id, name: habit.name, description: habit.description || '' });
                    }}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 px-2 py-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all"
                    aria-label="Edit habit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${habit.name}"? This will permanently delete it for all dates.`)) {
                        deleteHabit(habit.id);
                      }
                    }}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 px-2 py-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all"
                    aria-label="Delete habit"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
