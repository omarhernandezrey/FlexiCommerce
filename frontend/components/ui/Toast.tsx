'use client';

import { useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { type ToastType } from '@/hooks/useToast';

interface ToastProps {
  id: number;
  message: string;
  type: ToastType;
  onDismiss: (id: number) => void;
}

const toastConfig = {
  success: { bgColor: 'bg-green-50', borderColor: 'border-green-200', iconColor: 'text-green-600', textColor: 'text-green-900', icon: 'check_circle' },
  error: { bgColor: 'bg-red-50', borderColor: 'border-red-200', iconColor: 'text-red-600', textColor: 'text-red-900', icon: 'error' },
  info: { bgColor: 'bg-blue-50', borderColor: 'border-blue-200', iconColor: 'text-blue-600', textColor: 'text-blue-900', icon: 'info' },
  warning: { bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', iconColor: 'text-yellow-600', textColor: 'text-yellow-900', icon: 'warning' },
};

export function Toast({ id, message, type, onDismiss }: ToastProps) {
  const config = toastConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-top`}
    >
      <MaterialIcon name={config.icon} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`${config.textColor} font-medium`}>{message}</p>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <MaterialIcon name="close" />
      </button>
    </div>
  );
}
