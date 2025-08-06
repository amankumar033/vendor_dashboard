'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import RichTextEditor from './RichTextEditor';
import FormCard from './FormCard';
import { useToast } from './ToastContainer';
import { 
  FiSearch, 
  FiX, 
  FiClock, 
  FiCreditCard, 
  FiChevronDown, 
  FiDownload ,
  FiTrash2,
 
  
} from 'react-icons/fi';
// Add these imports at the top of your file
import {
  WrenchScrewdriverIcon,
  ClipboardDocumentIcon, // This replaces ClipboardDocumentListIcon

  CalendarIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon,

} from '@heroicons/react/24/outline';
interface ServiceOrder {
  service_order_id: string;
  user_id: string;
  service_id: string;
  vendor_id: string;
  service_name: string;
  service_description: string;
  service_category: string;
  service_type: string;
  base_price: number;
  final_price: number;
  duration_minutes: number;
  booking_date: string;
  service_date: string;
  service_time: string;
  service_status: string;
  service_pincode: string;
  service_address: string;
  additional_notes: string;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  was_available: number;
}

export default function ServiceOrdersManagement() {
  const { vendor } = useAuth();
  const { showSuccess, showError } = useToast();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [formData, setFormData] = useState({
    service_status: '',
    payment_status: '',
    additional_notes: ''
  });

  useEffect(() => {
    if (vendor?.vendor_id) {
      fetchServiceOrders();
    }
  }, [vendor]);

  useEffect(() => {
    filterOrders();
  }, [serviceOrders, searchTerm, statusFilter, paymentFilter]);

  const fetchServiceOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/service-orders?vendor_id=${vendor?.vendor_id}`);
      const data = await response.json();
      
      if (data.success) {
        setServiceOrders(data.serviceOrders);
      } else {
        setError('Failed to fetch service orders');
        showError('Failed to fetch service orders', data.error || 'Please try again later');
      }
    } catch (err) {
      setError('Error fetching service orders');
      showError('Error fetching service orders', 'Please check your connection and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = serviceOrders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.service_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.service_order_id.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.service_status === statusFilter);
    }

    // Payment filter
    if (paymentFilter) {
      filtered = filtered.filter(order => order.payment_status === paymentFilter);
    }

    setFilteredOrders(filtered);
  };

  const exportOrders = () => {
    const csvContent = [
      ['Order ID', 'Service Name', 'Category', 'Type', 'Customer ID', 'Service Date', 'Service Time', 'Status', 'Payment Status', 'Final Price', 'Base Price'],
      ...filteredOrders.map(order => [
        order.service_order_id,
        order.service_name,
        order.service_category,
        order.service_type,
        order.user_id,
        order.service_date,
        order.service_time,
        order.service_status,
        order.payment_status,
        order.final_price,
        order.base_price
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service_orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (!editingOrder) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/service-orders/${editingOrder.service_order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vendor_id: vendor?.vendor_id
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowModal(false);
        setEditingOrder(null);
        resetForm();
        fetchServiceOrders();
        showSuccess('Order Updated', 'Service order has been updated successfully');
      } else {
        setError(data.error || 'Operation failed');
        showError('Update Failed', data.error || 'Please try again');
      }
    } catch (err) {
      setError('Error updating service order');
      showError('Error updating service order', 'Please check your connection and try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (order: ServiceOrder) => {
    // Only allow editing if the order belongs to the current vendor
    if (order.vendor_id !== vendor?.vendor_id) {
      setError('You can only edit your own service orders');
      return;
    }
    
    setEditingOrder(order);
    setFormData({
      service_status: order.service_status,
      payment_status: order.payment_status,
      additional_notes: order.additional_notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (orderId: string, orderVendorId: string) => {
    // Only allow deletion if the order belongs to the current vendor
    if (orderVendorId !== vendor?.vendor_id) {
      setError('You can only delete your own service orders');
      showError('Permission Denied', 'You can only delete your own service orders');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this service order?')) return;
    
    try {
      setIsDeleting(orderId);
      const response = await fetch(`/api/service-orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendor?.vendor_id }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchServiceOrders();
        showSuccess('Order Deleted', 'Service order has been deleted successfully');
      } else {
        setError(data.error || 'Failed to delete service order');
        showError('Delete Failed', data.error || 'Please try again');
      }
    } catch (err) {
      setError('Error deleting service order');
      showError('Error deleting service order', 'Please check your connection and try again');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      service_status: '',
      payment_status: '',
      additional_notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; label: string } } = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'confirmed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      'in_progress': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'In Progress' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; label: string } } = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      'failed': { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      'refunded': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Refunded' }
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

 // Update your formatDate function to handle both cases:
function formatDate(input: string | Date, formatString = 'MM/dd/yyyy'): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    // Add more options as needed
  }).format(date);
}

  const formatTime = (timeString: string) => {
    return timeString;
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
  <> {/* Header Content */}
<div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
  {/* First Row - Heading and Export Button */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
    <div className="transition-all duration-300 hover:-translate-y-0.5">
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Service Orders Management
      </h1>
    
    </div>
    
    <button
      onClick={exportOrders}
      className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md hover:-translate-y-0.5 active:scale-95 shadow-sm whitespace-nowrap"
    >
      <FiDownload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
      Export CSV
    </button>
  </div>

  {/* Second Row - Search and Filters */}
  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
    {/* Search - Takes 2 columns on sm+ screens */}
    <div className="sm:col-span-2 relative group transition-all duration-300 hover:-translate-y-0.5">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
      </div>
      <input
        type="text"
        placeholder="Search orders..."
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

    {/* Status Filter */}
    <div className="relative group transition-all duration-300 hover:-translate-y-0.5">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiClock className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full pl-10 pr-8 py-2.5 text-gray-700 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-indigo-300 bg-white cursor-pointer transition-all duration-300 hover:shadow-sm"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <FiChevronDown className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
      </div>
    </div>

    {/* Payment Filter */}
    <div className="relative group transition-all duration-300 hover:-translate-y-0.5">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiCreditCard className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
      </div>
      <select
        value={paymentFilter}
        onChange={(e) => setPaymentFilter(e.target.value)}
        className="w-full pl-10 pr-8 py-2.5 text-gray-700 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-indigo-300 bg-white cursor-pointer transition-all duration-300 hover:shadow-sm"
      >
        <option value="">All Payments</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
        <option value="refunded">Refunded</option>
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

      {/* Service Orders Table */}
     <div className="bg-white rounded-lg shadow-sm overflow-hidden">
 
  
  {filteredOrders.length > 0 ? (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
              Order Details
            </th>
            <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
              Service
            </th>
            <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
              Price
            </th>
            <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
              Status
            </th>
            <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
              Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <tr 
              key={order.service_order_id} 
              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-gray-50 transition-all duration-500 ease-out transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100 border border-transparent hover:border-blue-200 rounded-lg cursor-pointer"
            >
              <td className="px-3 sm:px-6 py-4 transition-colors duration-300">
                <div>
                  <div className="text-sm font-medium text-gray-900 transition-colors duration-300">Order #{order.service_order_id}</div>
                  <div className="text-xs sm:text-sm text-gray-600 transition-colors duration-300">User ID: {order.user_id}</div>
                  <div className="text-xs sm:text-sm text-gray-600 transition-colors duration-300">Pincode: {order.service_pincode}</div>
                  {/* Mobile-only info */}
                  <div className="sm:hidden mt-2 space-y-1">
                    <div className="text-xs text-gray-600 transition-colors duration-300">
                      <span className="font-medium">Service:</span> {order.service_name}
                    </div>
                    <div className="text-xs text-gray-600 transition-colors duration-300">
                      <span className="font-medium">Date:</span> {formatDate(order.service_date)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(order.service_status)}
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap transition-colors duration-300">
                <div>
                  <div className="text-sm font-medium text-gray-900 transition-colors duration-300">{order.service_name}</div>
                  <div className="text-sm text-gray-600 transition-colors duration-300">{order.service_category} - {order.service_type}</div>
                  <div className="text-sm text-gray-600 transition-colors duration-300">{order.duration_minutes} min</div>
                </div>
              </td>
              <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap transition-colors duration-300">
                <div>
                  <div className="text-sm font-medium text-gray-900 transition-colors duration-300">{formatDate(order.service_date)}</div>
                  <div className="text-sm text-gray-600 transition-colors duration-300">{formatTime(order.service_time)}</div>
                  <div className="text-sm text-gray-600 transition-colors duration-300">Booked: {formatDate(order.booking_date)}</div>
                </div>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap transition-colors duration-300">
                <div>
                  <div className="text-sm font-bold text-green-600 transition-colors duration-300">${order.final_price}</div>
                  <div className="text-xs sm:text-sm text-gray-600 transition-colors duration-300">Base: ${order.base_price}</div>
                </div>
              </td>
              <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap transition-colors duration-300">
                {getStatusBadge(order.service_status)}
              </td>
              <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap transition-colors duration-300">
                {getPaymentStatusBadge(order.payment_status)}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors duration-300">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(order);
                    }}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Edit Order"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(order.service_order_id, order.vendor_id);
                    }}
                    disabled={isDeleting === order.service_order_id}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Order"
                  >
                    {isDeleting === order.service_order_id ? (
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
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No service orders yet</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Service orders will appear here when customers book your services.</p>
    </div>
  )}
</div>
 </>
)}
      {/* Form Card */}
      {showModal && editingOrder && (
      <div
 
 

>
  {editingOrder && (
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
                  Order #{editingOrder.service_order_id}
                </h1>
                <p className="text-sm text-gray-600">
                  {formatDate(editingOrder.service_date)} • {editingOrder.service_name}
                </p>
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
          {/* Order Details Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200 rounded-t-lg mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ClipboardDocumentIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-blue-900">
                  Order Details
                </h2>
                <p className="text-sm text-blue-700">
                  Service booking information
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2 text-blue-600" />
                Booking Information
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Order ID:</span> #{editingOrder.service_order_id}</p>
                <p><span className="font-medium">Service:</span> {editingOrder.service_name}</p>
                <p><span className="font-medium">Customer:</span> User #{editingOrder.user_id}</p>
                <p><span className="font-medium">Booked On:</span> {formatDate(editingOrder.booking_date)}</p>
              </div>
            </div>

            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <ClockIcon className="w-4 h-4 mr-2 text-blue-600" />
                Service Schedule
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Date:</span> {formatDate(editingOrder.service_date)}</p>
                <p><span className="font-medium">Time:</span> {formatTime(editingOrder.service_time)}</p>
                <p><span className="font-medium">Duration:</span> {editingOrder.duration_minutes} minutes</p>
                <p><span className="font-medium">Location:</span> {editingOrder.service_pincode}</p>
              </div>
            </div>
          </div>

          {/* Status Update Section */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-purple-200 rounded-t-lg mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-purple-900">
                  Update Status
                </h2>
                <p className="text-sm text-purple-700">
                  Manage order and payment status
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-purple-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service Status
              </label>
              <select
                required
                value={formData.service_status}
                onChange={(e) => setFormData({...formData, service_status: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="bg-white border border-purple-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                required
                value={formData.payment_status}
                onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">Select Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-lg mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Additional Notes
                </h2>
                <p className="text-sm text-gray-700">
                  Add any special instructions or notes
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-b-lg p-4 mb-6">
            <RichTextEditor
              value={formData.additional_notes}
              onChange={(value) => setFormData({...formData, additional_notes: value})}
              placeholder="Add any additional notes..."
              className="w-full"
            />
          </div>
        </div>

        {/* Footer */}
       <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Last updated: {formatDate(new Date())}
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
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Update Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

)}
</div>)}
    </div>
  );
} 