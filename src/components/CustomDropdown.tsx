'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxHeight?: string;
  searchable?: boolean;
  multiple?: boolean;
  selectedValues?: (string | number)[];
  onMultipleChange?: (values: (string | number)[]) => void;
  icon?: React.ReactNode;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  maxHeight = 'max-h-60',
  searchable = false,
  multiple = false,
  selectedValues = [],
  onMultipleChange,
  icon
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const filteredOptions = options.filter(option =>
    searchable && searchTerm
      ? option.label.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const selectedOption = options.find(option => option.value === value);
  const selectedLabels = multiple 
    ? options.filter(option => selectedValues.includes(option.value)).map(option => option.label)
    : [];

  const handleOptionClick = (optionValue: string | number) => {
    if (multiple && onMultipleChange) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onMultipleChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleRemoveSelection = (optionValue: string | number) => {
    if (multiple && onMultipleChange) {
      const newValues = selectedValues.filter(v => v !== optionValue);
      onMultipleChange(newValues);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'}
          transition-all duration-200 ease-in-out
          ${className.includes('h-10') ? 'h-10 py-2' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0 relative">
            {icon && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                {icon}
              </div>
            )}
            <div className={`flex-1 min-w-0 text-left ${icon ? 'pl-8' : ''}`}>
              {multiple ? (
                <div className="flex flex-wrap gap-1">
                  {selectedLabels.length > 0 ? (
                    selectedLabels.map((label, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md"
                      >
                        {label}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const option = options.find(opt => opt.label === label);
                            if (option) handleRemoveSelection(option.value);
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">{placeholder}</span>
                  )}
                </div>
              ) : (
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              )}
            </div>
          </div>
          <div className="ml-2 flex-shrink-0">
            {isOpen ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          )}

          {/* Options List */}
          <div className={`overflow-y-auto ${maxHeight} scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchable && searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple 
                  ? selectedValues.includes(option.value)
                  : value === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleOptionClick(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100
                      focus:outline-none transition-colors duration-150
                      ${isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                      ${option.disabled ? 'text-gray-400 cursor-not-allowed hover:bg-transparent' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      {multiple && (
                        <div className={`mr-2 w-4 h-4 border rounded flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
