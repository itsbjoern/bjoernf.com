import { useState } from 'react';
import { useHabits } from '../Context/HabitsContext';
import { DEFAULT_COLOR } from '../util';

export const AuthForm = () => {
  const { authenticate, register, isLoading } = useHabits();
  const [step, setStep] = useState<'initial' | 'register'>('initial');
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR);
  const [error, setError] = useState('');

  const handleAuthenticate = async () => {
    setError('');
    try {
      await authenticate();
    } catch (err) {
      // Check if it's because no passkey was found
      if (err instanceof Error && err.message.includes('passkey')) {
        setError('No passkey found. Please create a new tracker.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to authenticate');
      }
    }
  };

  const handleRegister = async () => {
    setError('');
    try {
      await register(selectedColor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create passkey');
      setStep('initial');
    }
  };

  if (step === 'register') {
    return (
      <div className="w-full max-w-md m-auto bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
          Create New Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
          Create a passkey to secure your habit tracker
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-2">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setStep('initial')}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Passkey'}
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-600 dark:text-gray-400 text-center">
          Your passkey will be securely stored on this device
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
        Sign in with your passkey or create a new tracker
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-2">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleAuthenticate}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Signing in...' : 'Sign in with Passkey'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">or</span>
          </div>
        </div>

        <button
          onClick={() => {
            setStep('register');
            setError('');
          }}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Create New Tracker
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-600 dark:text-gray-400 text-center">
        Passkeys use your device's biometric authentication or PIN for secure, passwordless sign-in
      </p>
    </div>
  );
};
