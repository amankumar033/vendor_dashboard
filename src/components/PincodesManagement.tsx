'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ServicePincode {
  id: number;
  service_id: number;
  pincode: string;
  service_name: string;
  vendor_id: number;
}

interface Service {
  service_id: number;
  name: string;
}

export default function PincodesManagement() {
  const { vendor } = useAuth();
  const [pincodes, setPincodes] = useState<ServicePincode[]>([]);
  const [filteredPincodes, setFilteredPincodes] = useState<ServicePincode[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      }
    } catch (err) {
      setError('Error fetching pincodes');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
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
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (err) {
      setError('Error saving pincode');
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

  const handleDelete = async (pincodeId: number, pincodeVendorId: number) => {
    // Only allow deletion if the pincode belongs to the current vendor
    if (pincodeVendorId !== vendor?.vendor_id) {
      setError('You can only delete pincodes for your own services');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this pincode?')) return;
    
    try {
      const response = await fetch(`/api/pincodes/${pincodeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendor?.vendor_id }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchPincodes();
      } else {
        setError(data.error || 'Failed to delete pincode');
      }
    } catch (err) {
      setError('Error deleting pincode');
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
      {/* Header */}
      <div className="bg-white rounded-lg p-4 sm:p-6 text-gray-900 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Service Pincodes Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage service availability by pincode</p>
          </div>
          <div className="w-full sm:w-auto space-y-3 sm:space-y-0 sm:space-x-4 sm:flex sm:items-center">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search pincodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="">All Services</option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={exportPincodes}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Export
            </button>
            <button
              onClick={openNewPincodeModal}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm font-medium rounded-lg text-emerald-600 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Add Pincode
            </button>
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
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pincode
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPincodes.map((pincode) => (
                <tr key={pincode.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-sm font-semibold text-gray-900">{pincode.service_name}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-emerald-500 mr-2" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 bg-emerald-100 text-emerald-800 px-2 sm:px-3 py-1 rounded-full">
                        {pincode.pincode}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(pincode)}
                        className="text-indigo-600 hover:text-indigo-800 p-1 sm:p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                        title="Edit Pincode"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pincode.id, pincode.vendor_id)}
                        className="text-red-600 hover:text-red-800 p-1 sm:p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Pincode"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-2xl rounded-xl bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                {editingPincode ? 'Edit Pincode' : 'Add New Pincode'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service</label>
                  <select
                    required
                    value={formData.service_id}
                    onChange={(e) => setFormData({...formData, service_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.service_id} value={service.service_id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      placeholder="e.g., 110001"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                  >
                    {editingPincode ? 'Update Pincode' : 'Create Pincode'}
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