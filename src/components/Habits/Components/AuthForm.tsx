import { useState } from 'react';
import { useHabits } from '../Context/HabitsContext';
import { COLOR_THEMES, type ColorTheme } from '../util';

export const AuthForm = () => {
  const { login, createTracker, isLoading } = useHabits();
  const [mode, setMode] = useState<'login' | 'create'>('create');
  const [trackerId, setTrackerId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>('github');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (mode === 'login' && !trackerId) {
      setError('Tracker ID is required');
      return;
    }

    try {
      if (mode === 'login') {
        await login(trackerId, password);
      } else {
        await createTracker(password, selectedTheme);
      }
    } catch (err) {
      // Error is already shown via toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Habit Tracker
          </h1>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                mode === 'create'
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              Create Tracker
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'login' && (
              <div>
                <label htmlFor="trackerId" className="block text-sm font-medium text-gray-700 mb-1">
                  Tracker ID
                </label>
                <input
                  id="trackerId"
                  type="text"
                  value={trackerId}
                  onChange={(e) => setTrackerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your tracker ID"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter password (min 8 characters)"
                disabled={isLoading}
              />
            </div>

            {mode === 'create' && (
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                  Color Theme
                </label>
                <select
                  id="theme"
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value as ColorTheme)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                >
                  {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                    <option key={key} value={key}>
                      {theme.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex gap-1">
                  {COLOR_THEMES[selectedTheme].colors.map((color, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : mode === 'login' ? 'Login' : 'Create Tracker'}
            </button>
          </form>

          {mode === 'create' && (
            <p className="mt-4 text-xs text-gray-600 text-center">
              Save your Tracker ID after creation - you'll need it to log in later
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
