import { useMemo } from 'react';
import { useHabits } from '../Context/HabitsContext';
import { formatDate, getColorForCount, getDaysInYear, formatDisplayDate } from '../util';

export const ContributionGraph = () => {
  const { color, completions, setSelectedDate, selectedDate } = useHabits();
  const today = new Date();
  const todayFmt = formatDate(today);
  const currentYear = today.getFullYear();
  const daysInYear = useMemo(() => getDaysInYear(currentYear), [currentYear]);

  // Group days by week
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    let currentWeek: Date[] = [];

    // Pad beginning to start on Sunday
    const firstDay = daysInYear[0];
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(new Date(0)); // Empty day
    }

    daysInYear.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(new Date(0)); // Empty day
      }
      weeksArray.push(currentWeek);
    }

    return weeksArray;
  }, [daysInYear]);

  const handleDayClick = (day: Date) => {
    if (day.getTime() === 0) return; // Empty day
    setSelectedDate(day);
  };

  const maxCount = useMemo(() => {
    let max = 0;
    completions.forEach((set) => {
      if (set.size > max) {
        max = set.size;
      }
    });
    return max;
  }, [completions]);

  const squareSize = 3;

  return (
    <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Activity in {currentYear}</h2>

      <div className="overflow-x-auto p-1 pb-4">
        <div className="inline-flex gap-[2px]">
          {weeks.map((_, i) => {
            if (i % 4 !== 0) {
              return <span key={i} className={`w-${squareSize} h-${squareSize} inline-block`} />;
            }
            const monthDate = new Date(currentYear, Math.floor(i / 4), 1);
            const monthStr = monthDate.toLocaleString('default', { month: 'short' });

            return (
              <span key={i} className={`text-xs text-gray-600 dark:text-gray-400 w-${squareSize} h-${squareSize} inline-block text-center`}>
                {monthStr}
              </span>
            )
          })}
        </div>
        <div className="inline-flex gap-[2px]">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[2px]">
              {week.map((day, dayIdx) => {
                if (day.getTime() === 0) {
                  return <div key={dayIdx} className={`w-${squareSize} h-${squareSize}`} />;
                }

                const dateStr = formatDate(day);
                const count = completions.get(dateStr)?.size || 0;
                const countColor = getColorForCount(count, maxCount, color);
                const isSelected =
                  formatDate(selectedDate) === dateStr;
                const isToday = todayFmt === dateStr;

                return (
                  <button
                    key={dayIdx}
                    onClick={() => handleDayClick(day)}
                    className={`w-${squareSize} h-${squareSize} rounded-sm transition-all hover:ring-2 bg-gray-200 dark:bg-gray-800 hover:ring-blue-500/50   ${isSelected ? 'ring-2 ring-blue-600' : isToday ? 'ring-1 ring-blue-600' : ''}`}
                    style={count === 0 ? undefined : { backgroundColor: countColor }}
                    title={`${formatDisplayDate(day)}: ${count} habit${count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-3 h-3 bg-gray-200 dark:bg-gray-800 rounded-sm"
              style={level === 0 ? undefined : { backgroundColor: getColorForCount(level, 4, color) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      <div className="mt-4 gap-2 flex justify-center">
        <button
          onClick={() => {
            const prevDay = new Date(selectedDate);
            prevDay.setDate(prevDay.getDate() - 1);
            setSelectedDate(prevDay);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm"
        >
          <span className="hidden sm:inline">&lt; </span>Yesterday
        </button>
        <button
          onClick={() => setSelectedDate(new Date())}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm"
        >
          Today
        </button>
        <button
          onClick={() => {
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            setSelectedDate(nextDay);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm"
        >
          Tomorrow<span className="hidden sm:inline"> &gt;</span>
        </button>
      </div>
    </div>
  );
};
