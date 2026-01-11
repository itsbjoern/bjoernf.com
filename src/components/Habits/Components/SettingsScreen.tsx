import { ColorPicker } from './ColorPicker';
import { useHabits } from '../Context/HabitsContext';

export const SettingsScreen = () => {
  const { color, updateColor, setCurrentView } = useHabits();

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Settings</h2>
        <ColorPicker selectedColor={color} setSelectedColor={updateColor} />
      </div>
      <div className="mt-4">
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
