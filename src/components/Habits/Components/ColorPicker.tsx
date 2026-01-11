import { useRef } from "react";
import { useHabits } from "../Context/HabitsContext";
import { DEFAULT_COLOR, getColorForCount } from "../util";

type ColorPickerProps = {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

export const ColorPicker = ({ selectedColor, setSelectedColor }: ColorPickerProps) => {
  const { isLoading } = useHabits();
  const pickerRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const changeColor = (color: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setSelectedColor(color);
    }, 400);
  }

  return (<div>
    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Choose color
    </label>
    <div className="flex items-center gap-3">
      <input
        id="color"
        type="color"
        ref={pickerRef}
        value={selectedColor}
        onChange={(e) => changeColor(e.target.value)}
        disabled={isLoading}
        className="w-48 h-10 p-0 border-0 rounded-md focus:outline-none focus:ring-0 bg-transparent"
      />
      <button
        type="button"
        onClick={() => pickerRef.current?.click()}
        disabled={isLoading}
        className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm"
      >
        Pick color
      </button>
      <button
        type="button"
        onClick={() => setSelectedColor(DEFAULT_COLOR)}
        disabled={isLoading}
        className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm"
      >
        Reset to Default
      </button>
    </div>
    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <span>Less</span>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-800"
            style={level === 0 ? undefined : { backgroundColor: getColorForCount(level, 4, selectedColor) }}
          />
        ))}
      </div>
      <span>More</span>
    </div>

  </div>)
}