import { useMemo } from 'react';
import { useHabits } from '../Context/HabitsContext';
import { formatDate, getColorForCount, getDaysInYear, formatDisplayDate } from '../util';

export const ContributionGraph = () => {
  const { colorTheme, completions, setSelectedDate, selectedDate } = useHabits();
  const currentYear = new Date().getFullYear();
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity in {currentYear}</h2>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-[2px]">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[2px]">
              {week.map((day, dayIdx) => {
                if (day.getTime() === 0) {
                  return <div key={dayIdx} className="w-3 h-3" />;
                }

                const dateStr = formatDate(day);
                const count = completions.get(dateStr)?.size || 0;
                const color = getColorForCount(count, colorTheme);
                const isSelected =
                  formatDate(selectedDate) === dateStr;

                return (
                  <button
                    key={dayIdx}
                    onClick={() => handleDayClick(day)}
                    className={`w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-blue-500/50 ${
                      isSelected ? 'ring-2 ring-blue-600' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={`${formatDisplayDate(day)}: ${count} habit${count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getColorForCount(level, colorTheme) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
