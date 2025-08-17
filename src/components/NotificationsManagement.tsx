'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './ToastContainer';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  BellIcon, 
  TrashIcon,
  CheckIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  description?: string;
  for_admin: boolean;
  for_dealer: boolean;
  for_user: boolean;
  for_vendor: boolean;
  product_id?: number;
  order_id?: number;
  user_id?: number;
  vendor_id?: number;
  dealer_id?: number;
  is_read: boolean;
  is_delivered: boolean;
  whatsapp_delivered: boolean;
  email_delivered: boolean;
  sms_delivered: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export default function NotificationsManagement() {
  const { vendor } = useAuth();
  const { showSuccess, showError } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [expandedNotifications, setExpandedNotifications] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

 
  useEffect(() => {
    if (vendor?.vendor_id) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [vendor]);

  // Check for notification ID in URL params for routing from notification bell
  useEffect(() => {
    const notificationId = searchParams.get('notification');
    if (notificationId && notifications.length > 0) {
      const notification = notifications.find(n => n.id.toString() === notificationId);
      if (notification) {
        setExpandedNotifications(new Set([notification.id]));
        // Clear the URL parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('notification');
        router.replace(newUrl.pathname + newUrl.search);
      }
    }
  }, [searchParams, notifications, router]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, statusFilter, typeFilter]);

  const fetchNotifications = async () => {
    if (!vendor?.vendor_id) return;

    try {
      const response = await fetch(`/api/notifications?vendor_id=${vendor.vendor_id}&limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      
      // Handle the API response structure
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      } else {
        setNotifications(data);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      const isRead = statusFilter === 'read';
      filtered = filtered.filter(notification => notification.is_read === isRead);
    }

    if (typeFilter) {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  const toggleExpanded = (notificationId: number) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const markAsRead = async (notificationId: number) => {
    setIsProcessing(`read-${notificationId}`);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

        setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
          )
        );
        showSuccess('Notification marked as read');
    } catch (err) {
      console.error('Error marking notification as read:', err);
        showError('Failed to mark notification as read');
    } finally {
      setIsProcessing(null);
    }
  };

  const removeNotification = async (notificationId: number) => {
    setIsProcessing(`remove-${notificationId}`);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove notification');
      }

      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
        showSuccess('Notification removed');
    } catch (err) {
      console.error('Error removing notification:', err);
        showError('Failed to remove notification');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleServiceRequestAction = async (notificationId: number, action: 'accept' | 'reject') => {
    setIsProcessing(`${action}-${notificationId}`);
    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId, action, vendor_id: vendor?.vendor_id })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} service request`);
      }

      const result = await response.json();
      
      // Update the notification in the list
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { 
                ...notification, 
                type: result.type,
                title: result.title,
                message: result.message,
                description: result.description,
                is_read: true
              }
            : notification
        )
      );

      showSuccess(`Service request ${action}ed successfully`);
    } catch (err) {
      console.error(`Error ${action}ing service request:`, err);
      showError(`Failed to ${action} service request`);
    } finally {
      setIsProcessing(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(diffInSeconds / 3600);
    const days = Math.floor(diffInSeconds / 86400);
    
    if (diffInSeconds < 3600) {
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m ago`;
      } else {
        return `${hours}h ago`;
      }
    } else if (diffInSeconds < 2592000) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'service_order_created':
        return '📋';
      case 'service_order_placed':
        return '📋';
      case 'service_order_accepted':
        return '✅';
      case 'service_order_rejected':
        return '❌';
      case 'payment_received':
        return '💰';
      case 'service_completed':
        return '🎉';
      default:
        return '📢';
    }
  };



  const formatMetadata = (metadata: any) => {
    if (!metadata) return null;
    
    try {
      const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      
      const formattedData: { [key: string]: string } = {};
      
      // Only show specific fields as requested
      const allowedFields: { [key: string]: string } = {
        service_order_id: 'Order ID',
        service_name: 'Service Name',
        final_price: 'Price',
        service_date: 'Date',
        service_time: 'Time',
        customer_name: 'Customer Name',
        customer_email: 'Customer Email',
        customer_phone: 'Customer Phone',
        service_address: 'Customer Address',
        service_status: 'Status',
        payment_status: 'Payment Status'
      };
      
      Object.entries(parsed).forEach(([key, value]) => {
        if (allowedFields[key] && value !== null && value !== undefined && value !== '') {
          const label = allowedFields[key];
          
          // Format dates
          if (key === 'service_date' && typeof value === 'string') {
            try {
              const date = new Date(value);
              formattedData[label] = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            } catch {
              formattedData[label] = String(value);
            }
          }
          // Format times
          else if (key === 'service_time' && typeof value === 'string') {
            try {
              const time = new Date(`2000-01-01T${value}`);
              formattedData[label] = time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });
            } catch {
              formattedData[label] = String(value);
            }
          }
          // Format prices
          else if (key === 'final_price' && typeof value === 'number') {
            formattedData[label] = `₹${value.toFixed(2)}`;
          }
          // Format prices as string
          else if (key === 'final_price' && typeof value === 'string') {
            formattedData[label] = `₹${value}`;
          }
          // Default formatting
          else {
            formattedData[label] = String(value);
          }
        }
      });
      
      return formattedData;
    } catch (error) {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchNotifications}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BellIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">Manage your notifications and service requests</p>
            </div>
          </div>
          <button
            onClick={fetchNotifications}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{notifications.length}</p>
              </div>
              <BellIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Unread</p>
                <p className="text-2xl font-bold text-red-900">{notifications.filter(n => !n.is_read).length}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Read</p>
                <p className="text-2xl font-bold text-green-900">{notifications.filter(n => n.is_read).length}</p>
              </div>
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Filtered</p>
                <p className="text-2xl font-bold text-purple-900">{filteredNotifications.length}</p>
              </div>
              <FunnelIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
            <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Status</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Types</option>
              <option value="service_order_created">Service Order Created</option>
              <option value="service_order_placed">Service Order Placed</option>
              <option value="service_order_accepted">Service Order Accepted</option>
              <option value="service_order_rejected">Service Order Rejected</option>
              <option value="payment_received">Payment Received</option>
              <option value="service_completed">Service Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Notifications ({filteredNotifications.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-all duration-200 ${
                  !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
            >
              {/* Initial View */}
                <div className="flex items-start space-x-4">
                  {/* Notification Icon */}
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-full bg-gray-100">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    </div>
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => toggleExpanded(notification.id)}>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            {notification.message}
                          </h3>

                          {notification.description && notification.type !== 'service_order_created' && notification.type !== 'service_order_placed' && (
                            <span className="text-xs text-blue-500 font-medium">(Click to expand)</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatTimeAgo(notification.created_at)}</span>
                          <span>•</span>
                          <span>
                      {new Date(notification.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                          </span>
                  </div>
                </div>
                
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.is_read && notification.type !== 'service_order_created' && notification.type !== 'service_order_placed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            disabled={isProcessing === `read-${notification.id}`}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50 text-sm font-medium"
                          >
                            Mark as Read
                          </button>
                        )}
                        
                  <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                    disabled={isProcessing === `remove-${notification.id}`}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1 rounded"
                    title="Remove Notification"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

                    {/* Expanded View - Full Data */}
                    {expandedNotifications.has(notification.id) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-4">
                          {/* Show description if available (but not for service_order_created) */}
                          {notification.description && notification.type !== 'service_order_created' && notification.type !== 'service_order_placed' && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {notification.description}
                              </p>
                            </div>
                          )}
                          
                          {/* Show formatted metadata if available */}
                          {notification.metadata && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              {(() => {
                                const metadata = formatMetadata(notification.metadata);
                                if (!metadata) return null;
                                
                                return (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Order ID */}
                                    {metadata['Order ID'] && (
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Order ID
                                        </span>
                                        <span className="text-sm text-gray-900 font-medium">
                                          {metadata['Order ID']}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Service Name */}
                                    {metadata['Service Name'] && (
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Service Name
                                        </span>
                                        <span className="text-sm text-gray-900 font-medium">
                                          {metadata['Service Name']}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Date */}
                                    {metadata['Date'] && (
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Date
                                        </span>
                                        <span className="text-sm text-gray-900 font-medium">
                                          {metadata['Date']}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Time */}
                                    {metadata['Time'] && (
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Time
                                        </span>
                                        <span className="text-sm text-gray-900 font-medium">
                                          {metadata['Time']}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Total */}
                                    {metadata['Price'] && (
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Total
                                        </span>
                                        <span className="text-sm text-gray-900 font-medium">
                                          {metadata['Price']}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Payment Status */}
                                    {metadata['Payment Status'] && (
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Payment
                                        </span>
                                        <span className="text-sm text-gray-900 font-medium">
                                          {metadata['Payment Status']}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Customer */}
                                    {metadata['Customer Name'] && (
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Customer
                                        </span>
                                        <span className="text-sm text-gray-900 font-medium">
                                          {metadata['Customer Name']}
                                        </span>
                                        {metadata['Customer Email'] && (
                                          <span className="text-xs text-gray-600">
                                            {metadata['Customer Email']}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Shipping/Address */}
                                    {metadata['Customer Address'] && (
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Shipping
                                        </span>
                                        <span className="text-sm text-gray-900 font-medium">
                                          {metadata['Customer Address']}
                                        </span>
                                        {metadata['Customer Phone'] && (
                                          <span className="text-xs text-gray-600">
                                            Pincode: {metadata['Customer Phone']}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                          
                                                    {/* Notification Details */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-900">
                                {getNotificationIcon(notification.type)} {notification.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                    
                            {/* Action Buttons for Service Requests */}
                            {(notification.type === 'service_order_created' || notification.type === 'service_order_placed') && !notification.is_read && (
                              <div className="flex items-center space-x-3">
                        <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleServiceRequestAction(notification.id, 'accept');
                                  }}
                                  disabled={isProcessing === `accept-${notification.id}`}
                                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    isProcessing === `accept-${notification.id}`
                                      ? 'text-white bg-green-600 cursor-not-allowed'
                                      : 'text-white bg-green-600 hover:bg-green-700'
                                  }`}
                                >
                                  {isProcessing === `accept-${notification.id}` ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                                      Accepting...
                                    </>
                                  ) : (
                                    <>
                                      <CheckIcon className="h-4 w-4 mr-1 inline" />
                                      Accept
                                    </>
                                  )}
                        </button>
                                
                      <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleServiceRequestAction(notification.id, 'reject');
                                  }}
                                  disabled={isProcessing === `reject-${notification.id}`}
                                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    isProcessing === `reject-${notification.id}`
                                      ? 'text-white bg-red-600 cursor-not-allowed'
                                      : 'text-white bg-red-600 hover:bg-red-700'
                                  }`}
                                >
                                  {isProcessing === `reject-${notification.id}` ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                                      Rejecting...
                                    </>
                                  ) : (
                                    <>
                                      <XMarkIcon className="h-4 w-4 mr-1 inline" />
                                      Reject
                                    </>
                                  )}
                      </button>
                    </div>
                            )}
                  </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))
        ) : (
            <div className="text-center py-16">
            <BellIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mt-4">No notifications yet</h3>
            <p className="text-gray-600 mt-2">You're all caught up! New notifications will appear here.</p>
          </div>
        )}
            </div>
          </div>
    </div>
  );
}
