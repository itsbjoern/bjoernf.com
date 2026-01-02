import { createContext, useCallback, useContext, useState } from "react";

export type Toast = {
  id?: number;
  message: string;
  color?: string;
  duration?: number;
};

export const ToastContext = createContext({
  toasts: [] as Array<Toast>,
  addToast: (toast: Toast) => {},
  removeToast: (id: number) => {},
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...toast, duration: toast.duration || 3000 }]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    }
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const Toasts = () => {
  const { toasts } = useToast();
  return (
    <div className="fixed inset-x-2 md:inset-x-1/3 top-10 flex flex-col gap-2 pointer-events-none z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-2 ${
            toast.color || "bg-gray-800"
          } text-white rounded-lg shadow-md transition-all`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
