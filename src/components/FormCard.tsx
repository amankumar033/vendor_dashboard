'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

interface FormCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryButtonText: string;
  secondaryButtonText?: string;
  onPrimaryClick: () => void;
  onSecondaryClick?: () => void;
  primaryButtonDisabled?: boolean;
  isLoading?: boolean;
}

export default function FormCard({
  isOpen,
  onClose,
  title,
  children,
  primaryButtonText,
  secondaryButtonText = 'Cancel',
  onPrimaryClick,
  onSecondaryClick,
  primaryButtonDisabled = false,
  isLoading = false
}: FormCardProps) {
  if (!isOpen) return null;

  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
    } else {
      onClose();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {children}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <button
          type="button"
          onClick={handleSecondaryClick}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {secondaryButtonText}
        </button>
        <button
          type="button"
          onClick={onPrimaryClick}
          disabled={primaryButtonDisabled || isLoading}
          className="flex-1 px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </div>
          ) : (
            primaryButtonText
          )}
        </button>
      </div>
    </div>
  );
} 