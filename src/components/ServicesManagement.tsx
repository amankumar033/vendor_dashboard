'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import RichTextEditor from './RichTextEditor';
import FormCard from './FormCard';
import { useToast } from './ToastContainer';
import CategoryDropdown from './CategoryDropdown';
import {
  WrenchScrewdriverIcon,
  XMarkIcon,
  InformationCircleIcon,
  IdentificationIcon,
  DocumentTextIcon,
  TagIcon,
  FolderIcon,
  PuzzlePieceIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ClockIcon,
  MapPinIcon,
  MapIcon,
  CheckIcon,
  ArrowPathIcon // Only needed if you add status updates later
} from '@heroicons/react/24/outline';
import { 
  FiDownload, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiTag, 
  FiActivity, 
  FiChevronDown,
  FiEdit,
  FiTrash2,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiInfo,
 


  FiChevronRight,
  FiChevronLeft,
  FiChevronUp,
  FiChevronDown as FiChevronDownIcon,
  FiX as FiXIcon
    
} from 'react-icons/fi';

interface Service {
  service_id: string;
  vendor_id: string;
  name: string;
  description: string;
  service_category_id: string;
  category_name?: string;
  type: string;
  base_price: number;
  duration_minutes: number;
  is_available: number;
  is_featured: number;
  service_pincodes: string;
  created_at: string;
  updated_at: string;
}

interface ServiceDetailPanelProps {
  service: Service | null;
  onClose: () => void;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  isDeleting: boolean;
}

function ServiceDetailPanel({ 
  service, 
  onClose, 
  onEdit, 
  onDelete,
  isDeleting 
}: ServiceDetailPanelProps) {
  if (!service) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 transform translate-x-0 transition-transform duration-300 ease-in-out overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 pt-[26px] pb-[26px] bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-20">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
            Service Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 transition-all duration-300 hover:scale-110 hover:bg-gray-100 rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Service Content */}
      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800 mb-1">{service.name}</h1>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {service.category_name || service.service_category_id}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {service.type}
                </span>
              </div>
            </div>
            <div className="text-right ml-4">
         <div className="text-2xl font-bold text-green-600">
  ${typeof service.base_price === 'number' ? service.base_price.toFixed(2) : '0.00'}
</div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center mb-4">
            {service.is_available ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FiCheckCircle className="mr-1" /> Available
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <FiXCircle className="mr-1" /> Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <FiClock className="w-4 h-4 text-gray-600 mr-2" />
              <div>
                <div className="font-semibold text-sm text-gray-700">Duration</div>
                <div className="text-sm text-gray-600">{service.duration_minutes} minutes</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <FiDollarSign className="w-4 h-4 text-gray-600 mr-2" />
              <div>
                <div className="font-semibold text-sm text-gray-700">Base Price</div>
                <div className="text-sm text-gray-600">
  ${typeof service.base_price === 'number' ? service.base_price.toFixed(2) : '0.00'}
</div>
              </div>
            </div>
          </div>

          {service.service_pincodes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center">
                <FiMapPin className="w-4 h-4 text-gray-600 mr-2" />
                <div>
                  <div className="font-semibold text-sm text-gray-700">Service Areas</div>
                  <div className="text-sm text-gray-600">
                    {service.service_pincodes.split(',').map(pin => pin.trim()).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Description</h3>
          <div className="bg-gray-50 rounded-lg p-3">
            <div 
              className="text-sm text-gray-700 leading-relaxed max-h-32 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: service.description }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 text-gray-600 mr-2" />
              <div>
                <div className="font-semibold text-sm text-gray-700">Created</div>
                <div className="text-sm text-gray-600">
                  {new Date(service.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 text-gray-600 mr-2" />
              <div>
                <div className="font-semibold text-sm text-gray-700">Updated</div>
                <div className="text-sm text-gray-600">
                  {new Date(service.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => onEdit(service)}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg text-sm"
          >
            <FiEdit className="w-4 h-4 mr-2" />
            Edit Service
          </button>
          <button
            onClick={() => onDelete(service.service_id)}
            disabled={isDeleting}
            className={`flex items-center justify-center px-4 py-2 font-semibold rounded-lg focus:outline-none transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg text-sm ${
              isDeleting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 text-white'
            }`}
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <FiTrash2 className="w-4 h-4 mr-2" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete Service'}
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg text-sm"
          >
            <FiX className="w-4 h-4 mr-2" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServicesManagement() {
  const { vendor } = useAuth();
  const { showSuccess, showError } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [formData, setFormData] = useState({
    vendor_id: vendor?.vendor_id || '',
    service_id: '',
    name: '',
    description: '',
    service_category_id: '',
    type: '',
    base_price: 0,
    duration_minutes: '',
    is_available: true,
    is_featured: false,
    service_pincodes: ''
  });
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
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
      // Explicitly type the service parameter
      const servicesWithNumbers = data.services.map((service: Service) => ({
        ...service,
        base_price: Number(service.base_price) || 0,
        duration_minutes: Number(service.duration_minutes) || 0
      }));
      setServices(servicesWithNumbers);
    } else {
      setError('Failed to fetch services');
      showError('Failed to fetch services', data.error || 'Please try again later');
    }
  } catch (err) {
    setError('Error fetching services');
    showError('Error fetching services', 'Please check your connection and try again');
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
        service.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(service => service.service_category_id === categoryFilter);
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
      ['Service ID', 'Name', 'Description', 'Category ID', 'Type', 'Base Price', 'Duration (min)', 'Available', 'Service Pincodes'],
              ...filteredServices.map(service => [
          service.service_id,
          service.name,
          service.description,
          service.service_category_id,
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
    return [...new Set(services.map(service => service.service_category_id))];
  };

 const handleSubmit = async () => {
  const vendor_id = vendor?.vendor_id;
  try {
    setIsSubmitting(true);
    const url = editingService 
      ? `/api/services/${editingService.service_id}`
      : '/api/services';
    
    const method = editingService ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        vendor_id: vendor_id,
        base_price: Number(formData.base_price), // Ensure number
        duration_minutes: parseInt(formData.duration_minutes),
        is_available: formData.is_available ? 1 : 0,
        is_featured: formData.is_featured ? 1 : 0
      }),
    });

      const data = await response.json();
      
      if (data.success) {
        setShowModal(false);
        setEditingService(null);
        resetForm();
        fetchServices();
        showSuccess(
          editingService ? 'Service Updated' : 'Service Created',
          editingService ? 'Service has been updated successfully' : 'New service has been created successfully'
        );
      } else {
        setError(data.error || 'Operation failed');
        showError('Operation Failed', data.error || 'Please try again');
      }
    } catch (err) {
      setError('Error saving service');
      showError('Error saving service', 'Please check your connection and try again');
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleEdit = (service: Service) => {
  if (service.vendor_id !== vendor?.vendor_id) {
    setError('You can only edit your own services');
    return;
  }
  
  setEditingService(service);
  setFormData({
    vendor_id: service.vendor_id,
    name: service.name,
    service_id: service.service_id,
    description: service.description,
    service_category_id: service.service_category_id,
    type: service.type,
    base_price: Number(service.base_price) || 0, // Ensure number
    duration_minutes: service.duration_minutes.toString(),
    is_available: service.is_available === 1,
    is_featured: service.is_featured === 1,
    service_pincodes: service.service_pincodes
  });
  setShowModal(true);
  setSelectedService(null);
};

  const handleDelete = async (serviceId: string, serviceVendorId: string) => {
    // Only allow deletion if the service belongs to the current vendor
    if (serviceVendorId !== vendor?.vendor_id) {
      setError('You can only delete your own services');
      showError('Permission Denied', 'You can only delete your own services');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      setIsDeleting(serviceId);
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendor?.vendor_id }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchServices();
        setSelectedService(null); // Close detail panel if open
        showSuccess('Service Deleted', 'Service has been deleted successfully');
      } else {
        setError(data.error || 'Failed to delete service');
        showError('Delete Failed', data.error || 'Please try again');
      }
    } catch (err) {
      setError('Error deleting service');
      showError('Error deleting service', 'Please check your connection and try again');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      vendor_id: vendor?.vendor_id || '',
      service_id: '',
      name: '',
      description: '',
      service_category_id: '',
      type: '',
      base_price: 0,
      duration_minutes: '',
      is_available: true,
      is_featured: false,
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

  const truncateDescription = (description: string, maxWords: number = 4) => {
    // Remove HTML tags and get plain text
    const plainText = description.replace(/<[^>]*>/g, '');
    const words = plainText.trim().split(/\s+/);
    
    if (words.length <= maxWords) {
      return description; // Return original if 4 words or less
    }
    
    // Take first 4 words and add ellipsis
    const truncatedWords = words.slice(0, maxWords).join(' ');
    return `${truncatedWords}...`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
   {!showModal && (
  <>
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-100 border border-transparent dashboard-card-hover">
        {/* Top Row - Heading and Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="text-3xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 hover:from-blue-500 hover:to-purple-700">
            Services Management
          </h3>
          
          <div className="flex gap-3">
            <button 
              onClick={exportServices}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 hover:shadow-md shadow-sm whitespace-nowrap"
            >
              <FiDownload className="w-5 h-5 mr-2" />
              Export
            </button>
            
            <button 
              onClick={openNewServiceModal}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-md shadow-sm whitespace-nowrap"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Add Service
            </button>
          </div>
        </div>

        {/* Second Row - Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search - Full width */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, category, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-300 focus:shadow-lg"
              />
            </div>
          </div>

          {/* Filter - Right side */}
          <div className="relative group sm:w-auto sm:flex-shrink-0">
            <div className="flex items-center px-3 py-[11px] border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent text-gray-900 bg-white hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-100">
              <FiFilter className="mr-2 text-gray-500 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-transparent pr-7 cursor-pointer focus:outline-none text-sm font-medium group-hover:text-blue-600 transition-colors duration-300"
              >
                <option value="all">All Categories</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Repair">Repair</option>
                <option value="Installation">Installation</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg 
                  className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-300 group-hover:rotate-180 group-hover:scale-110" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 w-4/5 h-0.5 bg-blue-100 transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center group-hover:bg-blue-200"></div>
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

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">All Services</h3>
        </div>
        
        {services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Service
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Category
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Price
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Duration
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr 
                    key={service.service_id} 
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-gray-50 transition-all duration-500 ease-out transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100 border border-transparent hover:border-blue-200 rounded-lg cursor-pointer"
                    onClick={() => setSelectedService(service)}
                  >
                    <td className="px-3 sm:px-6 py-4 transition-colors duration-300">
                      <div>
                        <div className="text-sm font-medium text-gray-900 transition-colors duration-300">{service.name}</div>
                        <div 
                          className="text-xs sm:text-sm text-gray-600 truncate max-w-xs transition-colors duration-300"
                          dangerouslySetInnerHTML={{ __html: truncateDescription(service.description) }}
                        />
                        {/* Mobile-only info */}
                        <div className="sm:hidden mt-2 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 transition-colors duration-300">
                              {service.category_name || service.service_category_id}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 transition-colors duration-300">
                              {service.type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 transition-colors duration-300">{service.duration_minutes} min</span>
                            {getStatusBadge(service.is_available)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap transition-colors duration-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 transition-colors duration-300">
                        {service.category_name || service.service_category_id}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap transition-colors duration-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 transition-colors duration-300">
                        {service.type}
                      </span>
                    </td>
                   <td className="px-3 sm:px-6 py-4 whitespace-nowrap transition-colors duration-300">
  <div className="text-sm font-bold text-green-600 transition-colors duration-300">
    ${typeof service.base_price === 'number' ? service.base_price.toFixed(2) : '0.00'}
  </div>
</td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 transition-colors duration-300">
                      {service.duration_minutes} min
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap transition-colors duration-300">
                      {getStatusBadge(service.is_available)}
                    </td>
                  
                   <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors duration-300">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(service);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit Service"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(service.service_id, service.vendor_id);
                          }}
                          disabled={isDeleting === service.service_id}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Service"
                        >
                          {isDeleting === service.service_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
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
</>
)}
      {/* Service Detail Panel */}
      <ServiceDetailPanel
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onEdit={handleEdit}
        onDelete={(serviceId) => handleDelete(serviceId, selectedService?.vendor_id || '')}
        isDeleting={isDeleting === selectedService?.service_id}
      />

      {/* Form Card */}
      {showModal && (
        <div className="min-h-screen bg-gray-50 flex flex-col form-transition">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative w-full max-w-4xl mx-auto form-scale-enter">
            
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <WrenchScrewdriverIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      {editingService ? `Edit Service: ${formData.name}` : 'Create New Service'}
                    </h1>
                  
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 px-6 py-8">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200 rounded-t-lg mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-blue-900">
                      Basic Information
                    </h2>
                    <p className="text-sm text-blue-700">
                      Service name and description
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-6">
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Service Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Premium Car Detailing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <RichTextEditor
                        value={formData.description}
                        onChange={(value) => setFormData({...formData, description: value})}
                        
                        className="w-full border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Classification Section */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-purple-200 rounded-t-lg mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <TagIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-purple-900">
                      Classification
                    </h2>
                    <p className="text-sm text-purple-700">
                      Categorize your service
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-purple-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <CategoryDropdown
                    value={formData.service_category_id}
                    onChange={(value) => setFormData({...formData, service_category_id: value})}
                    required={true}
                    placeholder="Select a category"
                    className="w-full"
                  />
                </div>

                <div className="bg-white border border-purple-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="e.g., Interior Cleaning"
                  />
                </div>
              </div>

              {/* Pricing & Duration Section */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 border-b border-green-200 rounded-t-lg mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-green-900">
                      Pricing & Duration
                    </h2>
                    <p className="text-sm text-green-700">
                      Set service cost and time
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Base Price ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-green-600">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.base_price}
                      onChange={(e) => setFormData({...formData, base_price: Number(e.target.value) || 0})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="30"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600">min</span>
                  </div>
                </div>
              </div>

              {/* Availability Section */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200 rounded-t-lg mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <MapPinIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-amber-900">
                      Availability
                    </h2>
                    <p className="text-sm text-amber-700">
                      Set service locations and status
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-6">
                <div className="bg-white border border-amber-200 rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Service Pincodes
                      </label>
                      <input
                        type="text"
                        value={formData.service_pincodes}
                        onChange={(e) => setFormData({...formData, service_pincodes: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                        placeholder="e.g., 110001, 110002, 110003"
                      />
                      <p className="mt-2 text-xs text-amber-600">Comma separated pincodes where service is available</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_available"
                        checked={formData.is_available}
                        onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
                        Service is available for booking
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {editingService ? `Last updated: ${formatDate(new Date())}` : 'Creating new service'}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{editingService ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>{editingService ? 'Update Service' : 'Create Service'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}