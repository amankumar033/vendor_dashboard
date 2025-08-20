'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CustomDropdown from './CustomDropdown';

interface ServiceCategory {
  service_category_id: string;
  name: string;
  vendor_id: string;
  description: string;
}

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string | number) => void;
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

  // Convert categories to dropdown options
  const dropdownOptions = categories.map(category => ({
    value: category.service_category_id,
    label: category.name,
    description: category.description
  }));

  return (
    <div className={className}>
      <CustomDropdown
        options={dropdownOptions}
        value={value}
        onChange={onChange}
        placeholder={isLoading ? 'Loading categories...' : placeholder}
        disabled={isLoading}
        searchable={true}
        maxHeight="max-h-60"
      />
      
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