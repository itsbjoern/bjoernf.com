import { ToastProvider, Toasts } from './Toasts';
import { HabitsProvider } from './Context/HabitsContext';
import { HabitTracker } from './HabitTracker';

export default function Loader() {
  return (
    <ToastProvider>
      <HabitsProvider>
        <HabitTracker />
        <Toasts />
      </HabitsProvider>
    </ToastProvider>
  );
}
