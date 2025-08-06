'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-l-green-500',
    icon: CheckCircleIcon,
    iconColor: 'text-green-600',
    textColor: 'text-green-700',
    titleColor: 'text-green-800'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-l-blue-500',
    icon: InformationCircleIcon,
    iconColor: 'text-blue-600',
    textColor: 'text-blue-700',
    titleColor: 'text-blue-800'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-l-amber-500',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-amber-600',
    textColor: 'text-amber-700',
    titleColor: 'text-amber-800'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-l-red-500',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-red-600',
    textColor: 'text-red-700',
    titleColor: 'text-red-800'
  }
};

export default function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const styles = toastStyles[type];
  const IconComponent = styles.icon;

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${styles.bg} ${styles.border} border-l-4 rounded-lg shadow-lg p-4 mb-3
        flex items-start space-x-3 min-w-80 max-w-md
      `}
    >
      <IconComponent className={`h-5 w-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
      
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium ${styles.titleColor}`}>
          {title}
        </h4>
        {message && (
          <p className={`text-sm ${styles.textColor} mt-1`}>
            {message}
          </p>
        )}
      </div>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
} 