import { useState } from 'react';
import { useHabits } from '../Context/HabitsContext';
import { formatDate, formatDisplayDate } from '../util';

export const HabitList = () => {
  const { habits, completions, selectedDate, toggleCompletion, createHabit, deleteHabit } =
    useHabits();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');

  const dateStr = formatDate(selectedDate);
  const completedHabitIds = completions.get(dateStr) || new Set();

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      await createHabit(newHabitName, newHabitDesc);
      setNewHabitName('');
      setNewHabitDesc('');
      setShowAddForm(false);
    } catch (err) {
      // Error shown via toast
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {formatDisplayDate(selectedDate)}
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 text-sm border border-gray-300 bg-white hover:bg-gray-50 rounded-md transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Habit'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddHabit} className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Habit name"
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <input
            type="text"
            value={newHabitDesc}
            onChange={(e) => setNewHabitDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
          >
            Add Habit
          </button>
        </form>
      )}

      {habits.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No habits yet. Add your first habit!</p>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => {
            const isCompleted = completedHabitIds.has(habit.id);

            return (
              <div
                key={habit.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => toggleCompletion(habit.id, dateStr)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{habit.name}</div>
                  {habit.description && (
                    <div className="text-sm text-gray-600 mt-1">{habit.description}</div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${habit.name}"?`)) {
                      deleteHabit(habit.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-sm text-red-600 hover:text-red-700 transition-opacity"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
