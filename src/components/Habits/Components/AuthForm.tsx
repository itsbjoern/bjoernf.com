import { useState } from 'react';
import { useHabits } from '../Context/HabitsContext';
import { ColorPicker } from './ColorPicker';
import { DEFAULT_COLOR } from '../util';

export const AuthForm = () => {
  const { login, createTracker, isLoading } = useHabits();
  const [step, setStep] = useState<'password' | 'confirm-create'>('password');
  const [password, setPassword] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setChecking(true);
    try {
      // Check if password exists
      const response = await fetch('/api/habits/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Failed to check password');
      }

      const data = await response.json();

      if (data.exists) {
        // Password exists, log in automatically
        await login(password);
      } else {
        // Password doesn't exist, show confirmation to create new tracker
        setStep('confirm-create');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleCreateConfirm = async () => {
    try {
      await createTracker(password, selectedColor);
    } catch (err) {
      // Error is already shown via toast
      // Go back to password step on error
      setStep('password');
    }
  };

  const handleCancel = () => {
    setStep('password');
    setPassword('');
    setError('');
  };

  if (step === 'confirm-create') {
    return (
      <div className="w-full max-w-md m-auto bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
          Create New Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
          No tracker found with this password. Create a new one?
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Tracker'}
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-600 dark:text-gray-400 text-center">
          Remember your password - you'll need it to log in later
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md m-auto bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Habit Tracker
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
        Enter your password to continue
      </p>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:border-gray-700 dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter password (min 8 characters)"
            disabled={isLoading || checking}
            autoFocus
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || checking}
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? 'Checking...' : isLoading ? 'Loading...' : 'Continue'}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-600 dark:text-gray-400 text-center">
        Enter your password to log in or create a new tracker
      </p>
    </div>
  );
};
