'use client'

import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  bgBlur?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  bgBlur = true
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm ${bgBlur ? "" : "h-fit w-fit m-auto"}`}
      onClick={onClose}
    >
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};