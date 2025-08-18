'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface ServiceCategory {
  service_category_id: string;
  name: string;
  vendor_id: string;
  description: string;
}

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export default function CategoryDropdown({
  value,
  onChange,
  required = false,
  placeholder = 'Select a category',
  className = ''
}: CategoryDropdownProps) {
  const { vendor } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/service-categories`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.service_category_id === value);
  
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          isLoading ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-900'
        }`}
        disabled={isLoading}
      >
        <div className="flex items-center justify-between">
          <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
            {selectedCategory ? selectedCategory.name : placeholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </div>

      </button>

      {isOpen && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {categories.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No categories available
            </div>
          ) : (
            <div className="py-1">
                             {categories.map((category) => (
                                  <button
                   key={category.service_category_id}
                   type="button"
                   onClick={() => {
                     onChange(category.service_category_id);
                     setIsOpen(false);
                   }}
                   className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                     value === category.service_category_id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                   }`}
                 >
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-gray-500">{category.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {required && (
        <input
          type="hidden"
          value={value}
          required
        />
      )}
    </div>
  );
} 