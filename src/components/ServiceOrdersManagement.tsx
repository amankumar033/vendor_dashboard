'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import RichTextEditor from './RichTextEditor';

interface ServiceOrder {
  service_order_id: number;
  user_id: number;
  service_id: number;
  vendor_id: number;
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
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      }
    } catch (err) {
      setError('Error fetching service orders');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingOrder) return;
    
    try {
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
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (err) {
      setError('Error updating service order');
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

  const handleDelete = async (orderId: number, orderVendorId: number) => {
    // Only allow deletion if the order belongs to the current vendor
    if (orderVendorId !== vendor?.vendor_id) {
      setError('You can only delete your own service orders');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this service order?')) return;
    
    try {
      const response = await fetch(`/api/service-orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendor?.vendor_id }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchServiceOrders();
      } else {
        setError(data.error || 'Failed to delete service order');
      }
    } catch (err) {
      setError('Error deleting service order');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
      {/* Header */}
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 text-gray-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Service Orders Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track your service orders</p>
          </div>
          <div className="w-full sm:w-auto space-y-3 sm:space-y-0 sm:space-x-4 sm:flex sm:items-center">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="relative">
              <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="relative">
              <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <button
              onClick={exportOrders}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              title="Export to CSV"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
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

      {/* Service Orders Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">All Service Orders</h3>
        </div>
        
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.service_order_id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Order #{order.service_order_id}</div>
                        <div className="text-xs sm:text-sm text-gray-500">User ID: {order.user_id}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Pincode: {order.service_pincode}</div>
                        {/* Mobile-only info */}
                        <div className="sm:hidden mt-2 space-y-1">
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Service:</span> {order.service_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Date:</span> {formatDate(order.service_date)}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(order.service_status)}
                            {getPaymentStatusBadge(order.payment_status)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.service_name}</div>
                        <div className="text-sm text-gray-500">{order.service_category} - {order.service_type}</div>
                        <div className="text-sm text-gray-500">{order.duration_minutes} min</div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{formatDate(order.service_date)}</div>
                        <div className="text-sm text-gray-500">{formatTime(order.service_time)}</div>
                        <div className="text-sm text-gray-500">Booked: {formatDate(order.booking_date)}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-green-600">${order.final_price}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Base: ${order.base_price}</div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.service_status)}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.payment_status)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                          title="Edit Order"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.service_order_id, order.vendor_id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete Order"
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
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No service orders yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Service orders will appear here when customers book your services.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-2xl rounded-xl bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Update Service Order
              </h3>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Order Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Order ID: #{editingOrder.service_order_id}</div>
                  <div>Service: {editingOrder.service_name}</div>
                  <div>Customer: User #{editingOrder.user_id}</div>
                  <div>Date: {formatDate(editingOrder.service_date)}</div>
                  <div>Time: {formatTime(editingOrder.service_time)}</div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service Status</label>
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
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
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
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                  <RichTextEditor
                    value={formData.additional_notes}
                    onChange={(value) => setFormData({...formData, additional_notes: value})}
                    placeholder="Add any additional notes..."
                    className="w-full"
                  />
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
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Update Order
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