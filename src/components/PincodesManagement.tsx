'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import FormCard from './FormCard';
import { useToast } from './ToastContainer';
import {
       // Location pin icon
  WrenchScrewdriverIcon, // Service/tools icon
  XMarkIcon,          // Close/delete icon
  ArrowPathIcon,      // Refresh/update icon (used in status section)
  ClipboardDocumentIcon, // Order details icon
  CalendarIcon,       // Date/booking icon
  ClockIcon,          // Time icon
  DocumentTextIcon,   // Notes icon
  CheckIcon,          // Success/confirm icon
  InformationCircleIcon, // Info icon
  TagIcon,            // Category/classification icon

} from "@heroicons/react/24/outline";
import { 
  FiDownload, 
  FiPlus, 
  FiSearch, 
  FiX, 
  FiFilter, 
  FiChevronDown 
} from 'react-icons/fi';
interface ServicePincode {
  id: number;
  service_id: string;
  pincode: string;
  service_name: string;
  vendor_id: string;
}

interface Service {
  service_id: string;
  name: string;
}

export default function PincodesManagement() {
  const { vendor } = useAuth();
  const { showSuccess, showError } = useToast();
  const [pincodes, setPincodes] = useState<ServicePincode[]>([]);
  const [filteredPincodes, setFilteredPincodes] = useState<ServicePincode[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPincode, setEditingPincode] = useState<ServicePincode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [formData, setFormData] = useState({
    service_id: '',
    pincode: ''
  });

  useEffect(() => {
    if (vendor?.vendor_id) {
      fetchPincodes();
      fetchServices();
    }
  }, [vendor]);

  useEffect(() => {
    filterPincodes();
  }, [pincodes, searchTerm, serviceFilter]);

  const fetchPincodes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/pincodes?vendor_id=${vendor?.vendor_id}`);
      const data = await response.json();
      
      if (data.success) {
        setPincodes(data.pincodes);
      } else {
        setError('Failed to fetch pincodes');
        showError('Failed to fetch pincodes', data.error || 'Please try again later');
      }
    } catch (err) {
      setError('Error fetching pincodes');
      showError('Error fetching pincodes', 'Please check your connection and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/services?vendor_id=${vendor?.vendor_id}`);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const filterPincodes = () => {
    let filtered = pincodes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pincode =>
        pincode.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pincode.pincode.includes(searchTerm)
      );
    }

    // Service filter
    if (serviceFilter) {
      filtered = filtered.filter(pincode => pincode.service_id.toString() === serviceFilter);
    }

    setFilteredPincodes(filtered);
  };

  const exportPincodes = () => {
    const csvContent = [
      ['ID', 'Service Name', 'Pincode'],
      ...filteredPincodes.map(pincode => [
        pincode.id,
        pincode.service_name,
        pincode.pincode
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pincodes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const url = editingPincode 
        ? `/api/pincodes/${editingPincode.id}`
        : '/api/pincodes';
      
      const method = editingPincode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: parseInt(formData.service_id),
          pincode: formData.pincode,
          vendor_id: vendor?.vendor_id
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowModal(false);
        setEditingPincode(null);
        resetForm();
        fetchPincodes();
        showSuccess(
          editingPincode ? 'Pincode Updated' : 'Pincode Added',
          editingPincode ? 'Pincode has been updated successfully' : 'New pincode has been added successfully'
        );
      } else {
        setError(data.error || 'Operation failed');
        showError('Operation Failed', data.error || 'Please try again');
      }
    } catch (err) {
      setError('Error saving pincode');
      showError('Error saving pincode', 'Please check your connection and try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pincode: ServicePincode) => {
    // Only allow editing if the pincode belongs to the current vendor
    if (pincode.vendor_id !== vendor?.vendor_id) {
      setError('You can only edit pincodes for your own services');
      return;
    }
    
    setEditingPincode(pincode);
    setFormData({
      service_id: pincode.service_id.toString(),
      pincode: pincode.pincode
    });
    setShowModal(true);
  };

  const handleDelete = async (pincodeId: number, pincodeVendorId: string) => {
    // Only allow deletion if the pincode belongs to the current vendor
    if (pincodeVendorId !== vendor?.vendor_id) {
      setError('You can only delete pincodes for your own services');
      showError('Permission Denied', 'You can only delete pincodes for your own services');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this pincode?')) return;
    
    try {
      setIsDeleting(pincodeId);
      const response = await fetch(`/api/pincodes/${pincodeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendor?.vendor_id }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchPincodes();
        showSuccess('Pincode Deleted', 'Pincode has been deleted successfully');
      } else {
        setError(data.error || 'Failed to delete pincode');
        showError('Delete Failed', data.error || 'Please try again');
      }
    } catch (err) {
      setError('Error deleting pincode');
      showError('Error deleting pincode', 'Please check your connection and try again');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      service_id: '',
      pincode: ''
    });
  };

  const openNewPincodeModal = () => {
    setEditingPincode(null);
    resetForm();
    setShowModal(true);
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
{!showModal && (
  <>      {/* Header */}
<div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
  {/* First Row - Heading and Action Buttons */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
    <div className="group transition-all duration-300 hover:-translate-y-0.5">
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-700 transition-all duration-500">
        Service Pincodes Management
      </h1>
      <p className="text-sm sm:text-base text-gray-500 mt-1 group-hover:text-gray-700 transition-colors duration-300">
        Manage service availability by pincode
      </p>
    </div>
    
    <div className="flex gap-3 w-full sm:w-auto">
      <button
        onClick={exportPincodes}
        className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-lg hover:-translate-y-0.5 active:scale-95 shadow-md"
      >
        <FiDownload className="h-4 w-4 sm:h-5 sm:w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
        <span className="group-hover:font-medium transition-all duration-300">Export CSV</span>
      </button>
      
      <button
        onClick={openNewPincodeModal}
        className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-lg hover:-translate-y-0.5 active:scale-95 shadow-md"
      >
        <FiPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
        <span className="group-hover:font-medium transition-all duration-300">Add Pincode</span>
      </button>
    </div>
  </div>

  {/* Second Row - Search and Filters */}
  <div className="flex flex-col sm:flex-row gap-3 w-full">
    {/* Search - Takes remaining space */}
    <div className="flex-1 relative group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg min-w-[200px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-all duration-300 group-hover:scale-110" />
      </div>
      <input
        type="text"
        placeholder="Search pincodes by number, city or service area..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all duration-300 bg-white"
      />
      {searchTerm && (
        <button 
          onClick={() => setSearchTerm('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-500 transition-all duration-300 hover:scale-110"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>

    {/* Service Filter - Right aligned with exact width needed */}
    <div className="relative group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-[200px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiFilter className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-all duration-300 group-hover:scale-110" />
      </div>
      <select
        value={serviceFilter}
        onChange={(e) => setServiceFilter(e.target.value)}
        className="w-full pl-10 pr-8 py-2.5 text-gray-700 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 bg-white cursor-pointer transition-all duration-300"
      >
        <option value="">All Services</option>
        {services.map((service) => (
          <option key={service.service_id} value={service.service_id}>
            {service.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <FiChevronDown className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-all duration-300 group-hover:scale-110" />
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

      {/* Pincodes Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
  <div className="table-container">
    <table className="responsive-table min-w-full divide-y divide-gray-200">
      <thead>
        <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
            Service
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
            Pincode
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-24">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredPincodes.map((pincode) => (
          <tr 
            key={pincode.id} 
            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-gray-50 transition-all duration-500 ease-out transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100 border border-transparent hover:border-blue-200 rounded-lg cursor-pointer"
          >
            <td className="px-6 py-4">
              <div className="text-sm font-semibold text-gray-900">
                {pincode.service_name}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 text-emerald-500 mr-2" />
                <span className="text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full group-hover:bg-emerald-200 group-hover:text-emerald-900">
                  {pincode.pincode}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 w-24">
              <div className="table-actions flex justify-start space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(pincode);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Edit Pincode"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(pincode.id, pincode.vendor_id);
                  }}
                  disabled={isDeleting === pincode.id}
                  className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Pincode"
                >
                  {isDeleting === pincode.id ? (
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
</div>

      {/* Empty State */}
      {filteredPincodes.length === 0 && !isLoading && (
        <div className="text-center py-8 sm:py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <div className="text-gray-400 mb-4 sm:mb-6">
            <MapPinIcon className="mx-auto h-16 w-16 sm:h-20 sm:w-20" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No pincodes yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Add pincodes to specify where your services are available.</p>
          <button
            onClick={openNewPincodeModal}
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Add Your First Pincode
          </button>
        </div>
      )}
 </>
)}
      
{showModal && (
  <div className="min-h-screen bg-gray-50 flex flex-col transition-all duration-300 ease-in-out">
    {/* Fixed Header */}
    <div className="bg-white sticky top-[60px] shadow-sm border-b border-gray-200 px-6 py-4 transition-all duration-300 hover:shadow-md">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingPincode(null);
                setFormData({ service_id: "", pincode: "" }); // Reset form
              }}
              className="mr-4 text-gray-600 hover:text-gray-900 transition-colors duration-300 p-1 rounded-full hover:bg-gray-100"
              disabled={isSubmitting}
            >
      
            </button>
            <h1 className="text-2xl font-bold text-gray-900 transition-colors duration-300 hover:text-blue-600">
              {editingPincode ? 'Edit Service Pincode' : 'Add Service Pincode'}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowModal(false);
              setEditingPincode(null);
              setFormData({ service_id: "", pincode: "" }); // Reset form
            }}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-300 p-1 rounded-full hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1 transition-colors duration-300 hover:text-gray-800">
          {editingPincode ? 'Update service pincode information' : 'Create a new service pincode'}
        </p>
      </div>
    </div>

    {/* Scrollable Main Content */}
    <div className="flex-1 px-6 py-8 overflow-y-auto transition-all duration-300 ease-in-out">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-6">
          {/* Service Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg transition-all duration-300 hover:bg-blue-200">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-blue-600 transition-colors duration-300 hover:text-blue-800" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 transition-colors duration-300 hover:text-blue-600">
                  Service Information
                </h2>
              </div>
              <p className="text-sm text-gray-600 mt-1 transition-colors duration-300 hover:text-gray-800">
                Select the service for this pincode
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-300 hover:text-gray-900">
                    Service *
                  </label>
                  <select
                    required
                    value={formData.service_id}
                    onChange={(e) => setFormData({...formData, service_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-300"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.service_id} value={service.service_id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg transition-all duration-300 hover:bg-blue-200">
                  <MapPinIcon className="w-5 h-5 text-blue-600 transition-colors duration-300 hover:text-blue-800" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 transition-colors duration-300 hover:text-blue-600">
                  Location Information
                </h2>
              </div>
              <p className="text-sm text-gray-600 mt-1 transition-colors duration-300 hover:text-gray-800">
                Enter the pincode for service availability
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-300 hover:text-gray-900">
                    Pincode *
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      placeholder="e.g., 110001"
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="bg-white border-t border-gray-200 px-6 py-4 transition-all duration-300 hover:shadow-md">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              setShowModal(false);
              setEditingPincode(null);
              setFormData({ service_id: "", pincode: "" }); // Reset form
            }}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{editingPincode ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{editingPincode ? 'Update Service Pincode' : 'Create Service Pincode'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
} 