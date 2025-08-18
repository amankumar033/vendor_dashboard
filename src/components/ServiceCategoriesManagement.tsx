'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FolderIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { 
  FiSearch, 
  FiX, 
  FiChevronDown, 
  FiDownload 
} from 'react-icons/fi';

interface ServiceCategory {
  service_category_id: string;
  name: string;
  vendor_id: string;
  description: string;
  created_at: string;
  updated_at: string;
  service_count?: number;
}

export default function ServiceCategoriesManagement() {
  const { vendor } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' or 'my'

  useEffect(() => {
    if (vendor?.vendor_id) {
      fetchCategories();
    }
  }, [vendor]);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, categoryFilter]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/service-categories/with-counts`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      } else {
        setError(data.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Error fetching categories');
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter === 'my') {
      filtered = filtered.filter(category => category.service_count && category.service_count > 0);
    }

    setFilteredCategories(filtered);
  };

  const exportCategories = () => {
    const headers = ['Category ID', 'Name', 'Description', 'Total Services', 'Created At'];
    const csvData = filteredCategories.map(category => [
      category.service_category_id,
      category.name,
      category.description,
      category.service_count || 0,
      new Date(category.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-categories-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Content */}
      <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* First Row - Heading and Export Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
          <div className="transition-all duration-300 hover:-translate-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Service Categories Management
            </h1>
          </div>
          
          <button
            onClick={exportCategories}
            className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md hover:-translate-y-0.5 active:scale-95 shadow-sm whitespace-nowrap"
          >
            <FiDownload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Second Row - Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search - Takes 2 columns on sm+ screens */}
          <div className="sm:col-span-2 relative group transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-indigo-300 transition-all duration-300 hover:shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-500 transition-colors duration-200"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative group transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FolderIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 text-gray-700 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-indigo-300 bg-white cursor-pointer transition-all duration-300 hover:shadow-sm"
            >
              <option value="all">All Categories</option>
              <option value="my">My Service Categories</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FiChevronDown className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Service Categories Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredCategories.length > 0 ? (
          <div className="table-container">
            <table className="responsive-table min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Category Details
                  </th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                     Description
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                     Created
                   </th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                     Services Count
                   </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                                 {filteredCategories.map((category) => (
                   <tr 
                     key={category.service_category_id} 
                     className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-gray-50 transition-all duration-500 ease-out transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100 border border-transparent hover:border-blue-200 rounded-lg cursor-pointer"
                   >
                     <td className="px-3 sm:px-6 py-4 transition-colors duration-300">
                       <div>
                         <div className="flex items-center space-x-3">
                           <FolderIcon className="h-6 w-6 text-blue-500" />
                           <div>
                             <div className="text-sm font-medium text-gray-900 transition-colors duration-300">{category.name}</div>
                             <div className="text-xs sm:text-sm text-gray-600 transition-colors duration-300">ID: {category.service_category_id}</div>
                           </div>
                         </div>

                      </div>
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap transition-colors duration-300">
                       <div className="text-sm text-gray-900 transition-colors duration-300">
                         {category.description || 'No description'}
                       </div>
                     </td>
                                         <td className="px-6 py-4 whitespace-nowrap transition-colors duration-300">
                       <div className="text-sm text-gray-900 transition-colors duration-300">
                         {formatDate(category.created_at)}
                       </div>
                     </td>
                                         <td className="px-3 sm:px-6 py-4 whitespace-nowrap transition-colors duration-300">
                       <div className="flex items-center space-x-2">
                         <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 transition-colors duration-300">
                           {category.service_count || 0} present in the category
                         </span>
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-16">
            <div className="text-gray-400 mb-4 sm:mb-6">
              <FolderIcon className="mx-auto h-16 w-16 sm:h-20 sm:w-20" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No categories found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No service categories have been created yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredCategories.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Total Categories: <span className="font-semibold text-gray-900">{filteredCategories.length}</span>
              </p>
              <p className="text-sm text-gray-600">
                Total Services: <span className="font-semibold text-gray-900">
                  {filteredCategories.reduce((total, cat) => total + (cat.service_count || 0), 0)}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Last updated: {formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 