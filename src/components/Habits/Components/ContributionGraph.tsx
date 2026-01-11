import { useMemo, useState } from 'react';
import { useHabits } from '../Context/HabitsContext';
import { formatDate, getColorForCount, getDaysInYear, formatDisplayDate } from '../util';

export const ContributionGraph = () => {
  const { color, completions, setSelectedDate, selectedDate, habits } = useHabits();
  const [hoveredDay, setHoveredDay] = useState<{ date: Date; count: number; x: number; y: number } | null>(null);
  const [selectedHabitIds, setSelectedHabitIds] = useState<Set<string>>(new Set());
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

  const toggleHabitFilter = (habitId: string) => {
    setSelectedHabitIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSelectedHabitIds(new Set());
  };

  const maxCount = useMemo(() => {
    let max = 0;
    completions.forEach((habitIds) => {
      let count = 0;
      if (selectedHabitIds.size > 0) {
        // Count only selected habits
        count = Array.from(habitIds).filter(id => selectedHabitIds.has(id)).length;
      } else {
        // Count all habits
        count = habitIds.size;
      }
      if (count > max) {
        max = count;
      }
    });
    return max;
  }, [completions, selectedHabitIds]);

  const squareSize = 3;

  return (
    <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 relative">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Activity in {currentYear}</h2>

      {/* Habit Filters */}
      {habits.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {habits.map((habit) => {
            const isSelected = selectedHabitIds.has(habit.id);
            return (
              <button
                key={habit.id}
                onClick={() => toggleHabitFilter(habit.id)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${isSelected
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
              >
                {habit.name}
              </button>
            );
          })}
          {selectedHabitIds.size > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition-all"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Tooltip */}
      {hoveredDay && (
        <div className="hidden sm:block absolute z-10 pointer-events-none bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-md text-sm font-medium shadow-lg whitespace-nowrap"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 15}px`,
            transform: 'translate(-50%, -100%)'
          }}>
          <div className="text-center">
            <div className="font-semibold">{formatDisplayDate(hoveredDay.date)}</div>
            <div className="text-xs opacity-90">
              {hoveredDay.count} habit{hoveredDay.count !== 1 ? 's' : ''} completed
              {selectedHabitIds.size > 0 && <span className="opacity-75"> (filtered)</span>}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
        </div>
      )}

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
        <div className="inline-flex gap-[3px]">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {week.map((day, dayIdx) => {
                if (day.getTime() === 0) {
                  return <div key={dayIdx} className={`w-${squareSize} h-${squareSize}`} />;
                }

                const dateStr = formatDate(day);
                const dayCompletions = completions.get(dateStr);
                let count = 0;

                if (dayCompletions) {
                  if (selectedHabitIds.size > 0) {
                    // Count only selected habits
                    count = Array.from(dayCompletions).filter(id => selectedHabitIds.has(id)).length;
                  } else {
                    // Count all habits
                    count = dayCompletions.size;
                  }
                }

                const countColor = getColorForCount(count, maxCount, color);
                const isSelected =
                  formatDate(selectedDate) === dateStr;
                const isToday = todayFmt === dateStr;

                return (
                  <button
                    key={dayIdx}
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const containerRect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
                      if (containerRect) {
                        setHoveredDay({
                          date: day,
                          count,
                          x: rect.left - containerRect.left + rect.width / 2,
                          y: rect.top - containerRect.top
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-${squareSize} h-${squareSize} rounded-sm transition-all hover:ring-2 bg-gray-200 dark:bg-gray-800 hover:ring-blue-500/50   ${isSelected ? 'ring-2 ring-blue-600' : isToday ? 'ring-1 ring-blue-600' : ''}`}
                    style={count === 0 ? undefined : { backgroundColor: countColor }}
                    aria-label={`${formatDisplayDate(day)}: ${count} habit${count !== 1 ? 's' : ''}`}
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
