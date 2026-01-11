import { Activity } from "react"

import { useHabits } from './Context/HabitsContext';
import { AuthForm } from './Components/AuthForm';
import { ContributionGraph } from './Components/ContributionGraph';
import { HabitList } from './Components/HabitList';
import { SettingsScreen } from "./Components/SettingsScreen";

const HabitTrackerContent = ({ children }: { children: React.ReactNode }) => {
  return (<div className="h-full rounded-lg flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 p-8">
    <div className="flex w-full flex-col">
      {children}
    </div>
  </div >)
}

export const HabitTracker = () => {
  const { currentView, logout, setCurrentView } = useHabits();

  if (currentView === 'auth') {
    return <HabitTrackerContent><AuthForm /></HabitTrackerContent>;
  }

  return (
    <HabitTrackerContent>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Habit Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Track and improve your habits over time</p>
        </div>
        <div className="gap-2 flex">
          <button
            onClick={() => setCurrentView((prev) => prev === 'settings' ? 'tracker' : 'settings')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm"
          >
            Settings
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Activity mode={currentView === "tracker" ? "visible" : "hidden"}>
          {/* Contribution Graph */}
          <div className="lg:col-span-2">
            <ContributionGraph />
          </div>

          {/* Habit List */}
          <div className="lg:col-span-2">
            <HabitList />
          </div>
        </Activity>

        <Activity mode={currentView === "settings" ? "visible" : "hidden"}>
          <div className="lg:col-span-2">
            <SettingsScreen />
          </div>
        </Activity>
      </div>
    </HabitTrackerContent>
  );
};
