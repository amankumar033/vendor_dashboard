'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './ToastContainer';
import { 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  ArrowPathIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface ServiceRequest {
  id: number;
  type: string;
  title: string;
  message: string;
  for_vendor: number;
  vendor_id: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export default function ServiceRequestsManagement() {
  const { vendor } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    console.log('Vendor data:', vendor);
    if (vendor?.vendor_id) {
      console.log('Vendor ID found, fetching service requests...');
      fetchServiceRequests();
    } else {
      console.log('No vendor ID found');
    }
  }, [vendor]);

  useEffect(() => {
    filterRequests();
  }, [serviceRequests, searchTerm, statusFilter]);

  const fetchServiceRequests = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching service requests for vendor:', vendor?.vendor_id);
      const response = await fetch(`/api/service-requests?vendor_id=${vendor?.vendor_id}`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        setServiceRequests(data.serviceRequests);
        console.log('Service requests set:', data.serviceRequests);
      } else {
        setError('Failed to fetch service requests');
        showError('Failed to fetch service requests', data.error || 'Please try again later');
      }
    } catch (err) {
      console.error('Error fetching service requests:', err);
      setError('Error fetching service requests');
      showError('Error fetching service requests', 'Please check your connection and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = serviceRequests;

    if (searchTerm) {
      filtered = filtered.filter(request => {
        const metadata = typeof request.metadata === 'string' 
          ? JSON.parse(request.metadata || '{}') 
          : request.metadata || {};
        return (
          request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          metadata.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          metadata.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          metadata.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter) {
      const isRead = statusFilter === 'read';
      filtered = filtered.filter(request => request.is_read === isRead);
    }

    setFilteredRequests(filtered);
  };

  const handleAction = async (requestId: number, action: 'accept' | 'reject') => {
    const processingKey = `${action}-${requestId}`;
    setIsProcessing(processingKey);
    
    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_id: requestId,
          action: action,
          vendor_id: vendor?.vendor_id
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        showSuccess(
          `Service Request ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
          data.message
        );
        // Refresh the list
        fetchServiceRequests();
        setSelectedRequest(null);
      } else {
        showError('Action Failed', data.error || 'Please try again');
      }
    } catch (err) {
      showError('Error processing request', 'Please check your connection and try again');
    } finally {
      setIsProcessing(null);
    }
  };

  const markAsRead = async (requestId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: requestId, action: 'read' }),
      });

      if (response.ok) {
        setServiceRequests(prev => 
          prev.map(r => 
            r.id === requestId ? { ...r, is_read: true } : r
          )
        );
      }
    } catch (error) {
      console.error('Error marking request as read:', error);
    }
  };

  const removeRequest = async (requestId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: requestId, action: 'remove' }),
      });

      if (response.ok) {
        setServiceRequests(prev => prev.filter(r => r.id !== requestId));
        setSelectedRequest(null);
        showSuccess('Request Removed', 'Service request has been removed from view');
      }
    } catch (error) {
      showError('Error removing request', 'Please try again');
    }
  };

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'service_order_created': return '📋';
      case 'service_order_accepted': return '✅';
      case 'service_order_rejected': return '❌';
      default: return '🔔';
    }
  };

  const getRequestColor = (type: string) => {
    switch (type) {
      case 'service_order_created': return 'bg-blue-100 text-blue-800';
      case 'service_order_accepted': return 'bg-green-100 text-green-800';
      case 'service_order_rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const exportRequests = () => {
    const csvContent = [
      ['Request ID', 'Service Name', 'Customer Name', 'Service Date', 'Service Time', 'Status', 'Created At'],
      ...filteredRequests.map(request => {
        const metadata = typeof request.metadata === 'string' 
          ? JSON.parse(request.metadata || '{}') 
          : request.metadata || {};
        return [
          request.id,
          metadata.service_name || 'N/A',
          metadata.user_name || 'N/A',
          metadata.service_date || 'N/A',
          metadata.service_time || 'N/A',
          request.type,
          new Date(request.created_at).toLocaleDateString()
        ];
      })
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service_requests.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="text-3xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Service Requests
          </h3>
          
          <div className="flex gap-3">
            <button 
              onClick={exportRequests}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Export
            </button>
            
            <button 
              onClick={fetchServiceRequests}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by service name, customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
            </div>
          </div>

          <div className="sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            >
              <option value="">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Service Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Service Requests ({filteredRequests.length})
          </h3>
        </div>
        
        {filteredRequests.length > 0 ? (
          <div className="table-container">
            <table className="responsive-table min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Service Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  const metadata = typeof request.metadata === 'string' 
          ? JSON.parse(request.metadata || '{}') 
          : request.metadata || {};
                  return (
                    <tr 
                      key={request.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-gray-50 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getRequestColor(request.type)}`}>
                            {getRequestIcon(request.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {metadata.service_name || 'Service Request'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTimeAgo(request.created_at)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {metadata.customer_name || metadata.user_name || 'Unknown Customer'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{metadata.service_category} - {metadata.service_type}</div>
                          <div className="text-gray-500">₹{metadata.final_price || metadata.base_price} • {metadata.service_duration || metadata.duration_minutes} min</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 text-gray-400 mr-1" />
                            {metadata.service_date}
                          </div>
                          <div className="flex items-center mt-1">
                            <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
                            {metadata.service_time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRequestColor(request.type)}`}>
                           {request.type === 'service_order_created' ? 'Pending' : 
                            request.type === 'service_order_accepted' ? 'Accepted' : 'Rejected'}
                         </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="table-actions flex space-x-2">
                                                     {request.type === 'service_order_created' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(request.id, 'accept');
                                }}
                                disabled={isProcessing === `accept-${request.id}`}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                                title="Accept Request"
                              >
                                {isProcessing === `accept-${request.id}` ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                ) : (
                                  <CheckIcon className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(request.id, 'reject');
                                }}
                                disabled={isProcessing === `reject-${request.id}`}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Reject Request"
                              >
                                {isProcessing === `reject-${request.id}` ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <XMarkIcon className="h-4 w-4" />
                                )}
                              </button>
                            </>
                          )}
                          {/* Remove button - only show for non-service requests */}
                          {request.type !== 'service_order_created' && request.type !== 'service_order_placed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRequest(request.id);
                              }}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"
                              title="Remove Request"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <InformationCircleIcon className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No service requests</h3>
            <p className="text-gray-600">You don't have any service requests at the moment.</p>
          </div>
        )}
      </div>

      {/* Service Request Detail Panel */}
      {selectedRequest && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 p-2 transition-all duration-300 hover:scale-110 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {(() => {
              const metadata = typeof selectedRequest.metadata === 'string' 
          ? JSON.parse(selectedRequest.metadata || '{}') 
          : selectedRequest.metadata || {};
              return (
                <>
                  {/* Request Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Service Request</h3>
                    
                    {/* Message and Description */}
                    <div className="space-y-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="font-semibold text-sm text-gray-700 mb-1">Message</div>
                        <div className="text-sm text-gray-600">{selectedRequest.message}</div>
                      </div>
                      
                      {metadata.service_description && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="font-semibold text-sm text-gray-700 mb-1">Service Description</div>
                          <div className="text-sm text-gray-600">{metadata.service_description}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <InformationCircleIcon className="w-4 h-4 text-gray-600 mr-2" />
                          <div>
                            <div className="font-semibold text-sm text-gray-700">Service Name</div>
                            <div className="text-sm text-gray-600">{metadata.service_name || 'N/A'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-600 mr-2" />
                          <div>
                            <div className="font-semibold text-sm text-gray-700">Customer</div>
                            <div className="text-sm text-gray-600">{metadata.customer_name || metadata.user_name || 'Unknown Customer'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="w-4 h-4 text-gray-600 mr-2 text-lg font-bold">₹</span>
                          <div>
                            <div className="font-semibold text-sm text-gray-700">Price & Duration</div>
                            <div className="text-sm text-gray-600">
                              ₹{metadata.final_price || metadata.base_price || '0'} • {metadata.service_duration || metadata.duration_minutes || '0'} minutes
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 text-gray-600 mr-2" />
                          <div>
                            <div className="font-semibold text-sm text-gray-700">Requested Date & Time</div>
                            <div className="text-sm text-gray-600">
                              {metadata.service_date || 'N/A'} at {metadata.service_time || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4 text-gray-600 mr-2" />
                          <div>
                            <div className="font-semibold text-sm text-gray-700">Service Address</div>
                            <div className="text-sm text-gray-600">{metadata.service_address || 'N/A'}</div>
                          </div>
                        </div>
                      </div>

                      {metadata.additional_notes && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="font-semibold text-sm text-gray-700 mb-1">Additional Notes</div>
                          <div className="text-sm text-gray-600">{metadata.additional_notes}</div>
                        </div>
                      )}
                    </div>
                  </div>

                                     {/* Action Buttons */}
                   {selectedRequest.type === 'service_order_created' && (
                    <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleAction(selectedRequest.id, 'accept')}
                        disabled={isProcessing === `accept-${selectedRequest.id}`}
                        className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg text-sm"
                      >
                        {isProcessing === `accept-${selectedRequest.id}` ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <CheckIcon className="w-4 h-4 mr-2" />
                        )}
                        Accept Request
                      </button>
                      <button
                        onClick={() => handleAction(selectedRequest.id, 'reject')}
                        disabled={isProcessing === `reject-${selectedRequest.id}`}
                        className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg text-sm"
                      >
                        {isProcessing === `reject-${selectedRequest.id}` ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <XMarkIcon className="w-4 h-4 mr-2" />
                        )}
                        Reject Request
                      </button>
                    </div>
                  )}

                  {/* Remove button - only show for non-service requests */}
                  {selectedRequest.type !== 'service_order_created' && selectedRequest.type !== 'service_order_placed' && (
                    <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => removeRequest(selectedRequest.id)}
                        className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg text-sm"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Remove Request
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
