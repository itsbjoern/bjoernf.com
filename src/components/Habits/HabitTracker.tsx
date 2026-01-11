import { useHabits } from './Context/HabitsContext';
import { AuthForm } from './Components/AuthForm';
import { ContributionGraph } from './Components/ContributionGraph';
import { HabitList } from './Components/HabitList';

export const HabitTracker = () => {
  const { currentView, trackerId, logout } = useHabits();

  if (currentView === 'auth') {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Habit Tracker</h1>
            <p className="text-sm text-gray-600 mt-1">
              Tracker ID: <span className="font-mono">{trackerId}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-md transition-colors text-sm"
          >
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contribution Graph */}
          <div className="lg:col-span-2">
            <ContributionGraph />
          </div>

          {/* Habit List */}
          <div className="lg:col-span-2">
            <HabitList />
          </div>
        </div>
      </div>
    </div>
  );
};
