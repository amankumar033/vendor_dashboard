'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon,
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ClockIcon,
  TrashIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useToast } from './ToastContainer';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  description?: string;
  for_vendor: number;
  vendor_id: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
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
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Check for notification ID in URL params for routing from notification bell
  useEffect(() => {
    const notificationId = searchParams.get('notification');
    if (notificationId && notifications.length > 0) {
      const notification = notifications.find(n => n.id.toString() === notificationId);
      if (notification) {
        setSelectedNotification(notification);
        // Clear the URL parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('notification');
        router.replace(newUrl.pathname + newUrl.search);
      }
    }
  }, [searchParams, notifications, router]);

  useEffect(() => {
    if (vendor?.vendor_id) {
      fetchNotifications();
    }
  }, [vendor]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, statusFilter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notifications?vendor_id=${vendor?.vendor_id}&limit=100`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      } else {
        setError('Failed to fetch notifications');
        showError('Failed to fetch notifications', data.error || 'Please try again later');
      }
    } catch (err) {
      setError('Error fetching notifications');
      showError('Error fetching notifications', 'Please check your connection and try again');
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

  const markAsRead = async (notificationId: number) => {
    setIsProcessing(`read-${notificationId}`);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId, action: 'read' }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        showSuccess('Notification marked as read');
      } else {
        showError('Failed to mark notification as read');
      }
    } catch (error) {
      showError('Error marking notification as read', 'Please try again');
    } finally {
      setIsProcessing(null);
    }
  };

  const removeNotification = async (notificationId: number) => {
    setIsProcessing(`remove-${notificationId}`);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId, action: 'remove' }),
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setSelectedNotification(null);
        showSuccess('Notification removed');
      } else {
        showError('Failed to remove notification');
      }
    } catch (error) {
      showError('Error removing notification', 'Please try again');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleServiceRequestAction = async (notificationId: number, action: 'accept' | 'reject') => {
    setIsProcessing(`${action}-${notificationId}`);
    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_id: notificationId,
          action: action,
          vendor_id: vendor?.vendor_id
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the notification type in the local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { 
                  ...n, 
                  type: action === 'accept' ? 'service_order_accepted' : 'service_order_rejected',
                  is_read: true 
                }
              : n
          )
        );
        
        showSuccess(`Service request ${action}ed successfully`);
      } else {
        showError('Action failed', data.error || 'Please try again');
      }
    } catch (error) {
      showError('Error processing service request action', 'Please try again');
    } finally {
      setIsProcessing(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_recieved': return '📦';
      case 'product_approved': return '✅';
      case 'product_rejected': return '❌';
      case 'user_registered': return '👤';
      case 'service_created': return '🛠️';
      case 'product_created': return '🛠️';
      case 'service_order_created': return '📋';
      case 'service_order_accepted': return '✅';
      case 'service_order_rejected': return '❌';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_recieved': return 'bg-blue-100 text-blue-800';
      case 'product_approved': return 'bg-green-100 text-green-800';
      case 'product_rejected': return 'bg-red-100 text-red-800';
      case 'user_registered': return 'bg-purple-100 text-purple-800';
      case 'service_created': return 'bg-orange-100 text-orange-800';
      case 'product_created': return 'bg-orange-100 text-orange-800';
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
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BellIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">Manage and view all system notifications.</p>
            </div>
          </div>
          <button
            onClick={fetchNotifications}
            className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Filtered</p>
                <p className="text-2xl font-bold text-purple-900">{filteredNotifications.length}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {[...new Set(notifications.map(n => n.type))].map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 group"
            >
              {/* Initial View */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{notification.title}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">{formatTimeAgo(notification.created_at)}</span>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    disabled={isProcessing === `remove-${notification.id}`}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Remove Notification"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Hover View - Full Data */}
              <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  
                  {/* Show description if available */}
                  {notification.description && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {notification.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)} {notification.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {notification.is_read ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Read
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <InformationCircleIcon className="w-3 h-3 mr-1" />
                          Unread
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Action Buttons for Service Requests */}
                      {notification.type === 'service_order_created' && !notification.is_read && (
                        <>
                          <button
                            onClick={() => handleServiceRequestAction(notification.id, 'accept')}
                            disabled={isProcessing === `accept-${notification.id}`}
                            className={`text-xs font-medium flex items-center px-2 py-1 rounded border transition-colors ${
                              isProcessing === `accept-${notification.id}`
                                ? 'text-white bg-green-600 border-green-600 cursor-not-allowed'
                                : 'text-white bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700'
                            }`}
                          >
                            {isProcessing === `accept-${notification.id}` ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                <span>Accepting...</span>
                              </>
                            ) : (
                              <>
                                <CheckIcon className="h-3 w-3 mr-1" />
                                Accept
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleServiceRequestAction(notification.id, 'reject')}
                            disabled={isProcessing === `reject-${notification.id}`}
                            className={`text-xs font-medium flex items-center px-2 py-1 rounded border transition-colors ${
                              isProcessing === `reject-${notification.id}`
                                ? 'text-white bg-red-600 border-red-600 cursor-not-allowed'
                                : 'text-white bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700'
                            }`}
                          >
                            {isProcessing === `reject-${notification.id}` ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                <span>Rejecting...</span>
                              </>
                            ) : (
                              <>
                                <XMarkIcon className="h-3 w-3 mr-1" />
                                Reject
                              </>
                            )}
                          </button>
                        </>
                      )}
                      
                      {!notification.is_read && notification.type !== 'service_order_created' && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          disabled={isProcessing === `read-${notification.id}`}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50 text-sm"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedNotification(notification)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <BellIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mt-4">No notifications yet</h3>
            <p className="text-gray-600 mt-2">You're all caught up! New notifications will appear here.</p>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Notification Details</h2>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedNotification.title}</h3>
                <p className="text-gray-600 mt-2">{selectedNotification.message}</p>
                
                {/* Show description if available */}
                {selectedNotification.description && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Description:</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedNotification.description}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationColor(selectedNotification.type)}`}>
                  {getNotificationIcon(selectedNotification.type)} {selectedNotification.type.replace('_', ' ').toUpperCase()}
                </span>
                {selectedNotification.is_read ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Read
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Unread
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                Created: {new Date(selectedNotification.created_at).toLocaleString()}
              </div>
              
              <div className="flex space-x-2 pt-4">
                {/* Action Buttons for Service Requests in Modal */}
                {selectedNotification.type === 'service_order_created' && !selectedNotification.is_read && (
                  <>
                    <button
                      onClick={() => handleServiceRequestAction(selectedNotification.id, 'accept')}
                      disabled={isProcessing === `accept-${selectedNotification.id}`}
                      className={`px-4 py-2 text-white rounded-lg transition-colors ${
                        isProcessing === `accept-${selectedNotification.id}`
                          ? 'bg-green-600 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isProcessing === `accept-${selectedNotification.id}` ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleServiceRequestAction(selectedNotification.id, 'reject')}
                      disabled={isProcessing === `reject-${selectedNotification.id}`}
                      className={`px-4 py-2 text-white rounded-lg transition-colors ${
                        isProcessing === `reject-${selectedNotification.id}`
                          ? 'bg-red-600 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {isProcessing === `reject-${selectedNotification.id}` ? 'Rejecting...' : 'Reject'}
                    </button>
                  </>
                )}
                
                {!selectedNotification.is_read && selectedNotification.type !== 'service_order_created' && (
                  <button
                    onClick={() => markAsRead(selectedNotification.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => removeNotification(selectedNotification.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Remove
                </button>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
