'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import RichTextEditor from './RichTextEditor';

interface Service {
  service_id: number;
  vendor_id: number;
  name: string;
  description: string;
  category: string;
  type: string;
  base_price: number;
  duration_minutes: number;
  is_available: number;
  service_pincodes: string;
  created_at: string;
  updated_at: string;
}

export default function ServicesManagement() {
  const { vendor } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: '',
    base_price: '',
    duration_minutes: '',
    is_available: true,
    service_pincodes: ''
  });

  useEffect(() => {
    if (vendor?.vendor_id) {
      fetchServices();
    }
  }, [vendor]);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, categoryFilter, availabilityFilter]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/services?vendor_id=${vendor?.vendor_id}`);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services);
      } else {
        setError('Failed to fetch services');
      }
    } catch (err) {
      setError('Error fetching services');
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(service => service.category === categoryFilter);
    }

    // Availability filter
    if (availabilityFilter) {
      const isAvailable = availabilityFilter === 'available' ? 1 : 0;
      filtered = filtered.filter(service => service.is_available === isAvailable);
    }

    setFilteredServices(filtered);
  };

  const exportServices = () => {
    const csvContent = [
      ['Service ID', 'Name', 'Description', 'Category', 'Type', 'Base Price', 'Duration (min)', 'Available', 'Service Pincodes'],
      ...filteredServices.map(service => [
        service.service_id,
        service.name,
        service.description,
        service.category,
        service.type,
        service.base_price,
        service.duration_minutes,
        service.is_available ? 'Yes' : 'No',
        service.service_pincodes
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'services.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getUniqueCategories = () => {
    return [...new Set(services.map(service => service.category))];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingService 
        ? `/api/services/${editingService.service_id}`
        : '/api/services';
      
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vendor_id: vendor?.vendor_id,
          base_price: parseFloat(formData.base_price),
          duration_minutes: parseInt(formData.duration_minutes),
          is_available: formData.is_available ? 1 : 0
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowModal(false);
        setEditingService(null);
        resetForm();
        fetchServices();
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (err) {
      setError('Error saving service');
    }
  };

  const handleEdit = (service: Service) => {
    // Only allow editing if the service belongs to the current vendor
    if (service.vendor_id !== vendor?.vendor_id) {
      setError('You can only edit your own services');
      return;
    }
    
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      type: service.type,
      base_price: service.base_price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      is_available: service.is_available === 1,
      service_pincodes: service.service_pincodes
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId: number, serviceVendorId: number) => {
    // Only allow deletion if the service belongs to the current vendor
    if (serviceVendorId !== vendor?.vendor_id) {
      setError('You can only delete your own services');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendor?.vendor_id }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchServices();
      } else {
        setError(data.error || 'Failed to delete service');
      }
    } catch (err) {
      setError('Error deleting service');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      type: '',
      base_price: '',
      duration_minutes: '',
      is_available: true,
      service_pincodes: ''
    });
  };

  const openNewServiceModal = () => {
    setEditingService(null);
    resetForm();
    setShowModal(true);
  };

  const getStatusBadge = (isAvailable: number) => {
    return isAvailable ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Available
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Unavailable
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your service offerings</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={openNewServiceModal}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Add Service
          </button>
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

      {/* Filter and Export Controls */}
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-6">
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          {/* Export Button */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              onClick={exportServices}
              className="w-full inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">All Services</h3>
        </div>
        
        {services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.service_id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        <div 
                          className="text-xs sm:text-sm text-gray-500 truncate max-w-xs"
                          dangerouslySetInnerHTML={{ __html: service.description }}
                        />
                        {/* Mobile-only info */}
                        <div className="sm:hidden mt-2 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {service.category}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {service.type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{service.duration_minutes} min</span>
                            {getStatusBadge(service.is_available)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {service.category}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {service.type}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">${service.base_price}</div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.duration_minutes} min
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(service.is_available)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                          title="Edit Service"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.service_id, service.vendor_id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete Service"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
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
              <svg className="mx-auto h-16 w-16 sm:h-20 sm:w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No services yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Get started by adding your first service to attract customers.</p>
            <button
              onClick={openNewServiceModal}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Add Your First Service
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md shadow-2xl rounded-xl bg-white m-4">
            <div className="mt-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter service name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({...formData, description: value})}
                    placeholder="Describe your service"
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="e.g., Maintenance"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                    <input
                      type="text"
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="e.g., Oil Service"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.base_price}
                      onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (min)</label>
                    <input
                      type="number"
                      required
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="30"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service Pincodes</label>
                  <input
                    type="text"
                    value={formData.service_pincodes}
                    onChange={(e) => setFormData({...formData, service_pincodes: e.target.value})}
                    placeholder="e.g., 110001,110002,110003"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                
                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-900">
                    Service is available for booking
                  </label>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 