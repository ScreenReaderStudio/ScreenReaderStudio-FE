'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { ReactNode } from 'react';

export const TOAST_PLACEMENTS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;

type ToastPlacement = (typeof TOAST_PLACEMENTS)[number];

interface ToastType {
  id: number;
  message: string;
  placement: ToastPlacement;
  variant: 'alert' | 'status';
}

export interface ToastOptions {
  message: string;
  placement?: ToastPlacement;
  duration?: number | null;
  variant?: ToastType['variant'];
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
  const nextToastId = useRef(0);
  const timeoutIds = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const removeToast = useCallback((id: number) => {
    const timeoutId = timeoutIds.current.get(id);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutIds.current.delete(id);
    }

    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, placement = 'topRight', duration, variant = 'status' }: ToastOptions) => {
      nextToastId.current += 1;
      const id = nextToastId.current;
      const effectiveDuration =
        duration === undefined ? (variant === 'alert' ? null : 5000) : duration;

      setToasts((prevToasts) => [...prevToasts, { id, message, placement, variant }]);

      if (effectiveDuration !== null) {
        const timeoutId = setTimeout(() => removeToast(id), effectiveDuration);
        timeoutIds.current.set(id, timeoutId);
      }
    },
    [removeToast]
  );

  useEffect(() => {
    const currentTimeoutIds = timeoutIds.current;

    return () => {
      currentTimeoutIds.forEach(clearTimeout);
      currentTimeoutIds.clear();
    };
  }, []);

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
              role={toast.variant}
              aria-atomic="true"
              className="relative w-fit max-w-[90vw] min-w-40 rounded border border-gray-200 bg-white py-2 pr-8 pl-4 text-gray-800 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <p className="font-sans text-sm">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full p-1 text-lg text-gray-500 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none dark:text-gray-400 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-100"
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
