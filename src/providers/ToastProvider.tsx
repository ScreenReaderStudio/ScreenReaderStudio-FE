'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export const TOAST_PLACEMENTS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;

type ToastPlacement = (typeof TOAST_PLACEMENTS)[number];

interface ToastType {
  id: number;
  message: string;
  placement: ToastPlacement;
}

export interface ToastOptions {
  message: string;
  placement?: ToastPlacement;
  duration?: number;
}

export interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const getPlacementClass = (placement: ToastPlacement) => {
  switch (placement) {
    case 'topLeft':
      return 'top-4 left-4';
    case 'topRight':
      return 'top-4 right-4';
    case 'bottomLeft':
      return 'bottom-4 left-4';
    case 'bottomRight':
      return 'bottom-4 right-4';
  }
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};

export interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, placement = 'topRight', duration = 3000 }: ToastOptions) => {
      const id = Date.now();
      setToasts((prevToasts) => [...prevToasts, { id, message, placement }]);

      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const toastsByPlacement = useMemo(() => {
    return toasts.reduce(
      (acc, toast) => {
        acc[toast.placement] = acc[toast.placement] || [];
        acc[toast.placement].push(toast);
        return acc;
      },
      {} as Record<ToastPlacement, ToastType[]>
    );
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {Object.entries(toastsByPlacement).map(([placement, placementToasts]) => (
        <div
          key={placement}
          className={`fixed z-50 space-y-2 px-6 pt-16 ${getPlacementClass(
            placement as ToastPlacement
          )}`}
        >
          {placementToasts.map((toast) => (
            <div
              key={toast.id}
              className="relative w-fit max-w-[90vw] min-w-40 rounded border border-gray-200 bg-white py-2 pr-8 pl-4 text-gray-800 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <p className="font-sans text-sm">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full p-1 text-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="알림 닫기"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ))}
    </ToastContext.Provider>
  );
};
