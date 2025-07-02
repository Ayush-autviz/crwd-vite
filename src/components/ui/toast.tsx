import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  show: boolean;
  onHide?: () => void;
  duration?: number;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  show,
  onHide,
  duration = 1500,
  className
}) => {
  useEffect(() => {
    if (show && onHide) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, onHide, duration]);

  return (
    <div
      className={cn(
        "fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50",
        "bg-black/90 text-white px-4 py-2 rounded-full",
        "text-sm font-medium shadow-lg",
        "transition-all duration-300",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none",
        className
      )}
    >
      {message}
    </div>
  );
}; 