'use client';

import { useEffect } from 'react';
import { cn } from '../../lib/utils';

interface BaseModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-md', 'max-w-lg', 'max-w-2xl', 'max-w-3xl'
  zIndex?: string; // e.g. 'z-50', 'z-[60]', 'z-[70]'
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

export function BaseModal({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-2xl',
  zIndex = 'z-50',
  showCloseButton = false,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  className,
}: BaseModalProps) {
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape || !onClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={closeOnBackdropClick ? onClose : undefined}
      className={cn(
        'fixed inset-0 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none',
        zIndex
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'bg-slate-900 border border-slate-700/80 rounded-3xl w-full p-5 sm:p-6 shadow-2xl flex flex-col text-slate-100 max-h-[92vh] overflow-y-auto custom-scrollbar relative',
          maxWidth,
          className
        )}
      >
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn-close absolute top-4 right-4 z-10 text-sm"
            title="ปิดหน้าต่าง"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
