'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

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
  metadata?: any;
}

export default function NotificationBell() {
  const { vendor } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [autoRefresh, setAutoRefresh] = useState(true);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;
  const totalCount = notifications.length;

  // Update time every minute for real-time timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (vendor?.vendor_id) {
      fetchNotifications();
      // Set up auto-refresh only if enabled
      if (autoRefresh) {
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
      }
    } else {
      // Clear notifications if no vendor is loaded
      setNotifications([]);
    }
  }, [vendor, autoRefresh]);

  const fetchNotifications = useCallback(async (showLoading = true) => {
    // Don't fetch if vendor is not available
    if (!vendor?.vendor_id) {
      setNotifications([]);
      return;
    }
    
    try {
      if (showLoading) setIsLoading(true);
      const response = await fetch(`/api/notifications?vendor_id=${vendor.vendor_id}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [vendor?.vendor_id]);

  const handleRefresh = () => {
    fetchNotifications(true);
  };

  const navigateToNotification = (notificationId: number) => {
    setIsOpen(false);
    router.push(`/dashboard/notifications?notification=${notificationId}`);
  };

  const markAsRead = async (notificationId: number) => {
    const loadingKey = `read-${notificationId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: notificationId, action: 'read' }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const removeNotification = async (notificationId: number) => {
    const loadingKey = `remove-${notificationId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: notificationId, action: 'remove' }),
      });

      if (response.ok) {
        // Remove the notification from the local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error removing notification:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleServiceRequestAction = async (notificationId: number, action: 'accept' | 'reject') => {
    const loadingKey = `${action}-${notificationId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
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
        
        // Show success message
        console.log(`Service request ${action}ed successfully`);
      } else {
        console.error('Action failed:', data.error);
      }
    } catch (error) {
      console.error('Error processing service request action:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const markAllAsRead = async () => {
    setLoadingStates(prev => ({ ...prev, markAllAsRead: true }));
    
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => markAsRead(n.id))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, markAllAsRead: false }));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_recieved':
        return '📦';
      case 'product_approved':
        return '✅';
      case 'product_rejected':
        return '❌';
      case 'user_registered':
        return '👤';
      case 'service_created':
        return '🛠️';
      case 'product_created':
        return '🛠️';
      case 'service_order_created':
        return '📋';
      case 'service_order_accepted':
        return '✅';
      case 'service_order_rejected':
        return '❌';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_recieved':
        return 'bg-blue-100 text-blue-800';
      case 'product_approved':
        return 'bg-green-100 text-green-800';
      case 'product_rejected':
        return 'bg-red-100 text-red-800';
      case 'user_registered':
        return 'bg-purple-100 text-purple-800';
      case 'service_created':
        return 'bg-orange-100 text-orange-800';
      case 'product_created':
        return 'bg-orange-100 text-orange-800';
      case 'service_order_created':
        return 'bg-blue-100 text-blue-800';
      case 'service_order_accepted':
        return 'bg-green-100 text-green-800';
      case 'service_order_rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    // First filter by for_vendor = 1 (ensure it's a number)
    if (notification.for_vendor !== 1) return false;
    
    // Filter by vendor_id to ensure only current vendor's notifications
    if (notification.vendor_id !== vendor?.vendor_id) return false;
    
    // Then filter by tab
    if (activeTab === 'unread') return !notification.is_read;
    if (activeTab === 'read') return notification.is_read;
    return true;
  });

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-6 w-6 text-blue-600 animate-pulse" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                                 {unreadCount > 0 && (
                   <button
                     onClick={markAllAsRead}
                     disabled={loadingStates.markAllAsRead}
                     className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center space-x-1 ${
                       loadingStates.markAllAsRead 
                         ? 'bg-blue-400 text-white cursor-not-allowed' 
                         : 'bg-blue-600 text-white hover:bg-blue-700'
                     }`}
                   >
                     {loadingStates.markAllAsRead ? (
                       <>
                         <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                         <span>Marking...</span>
                       </>
                     ) : (
                       'Mark all read'
                     )}
                   </button>
                 )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'all' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All {totalCount > 0 ? `(${totalCount})` : ''}
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'unread' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
            <button
              onClick={() => setActiveTab('read')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'read' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Read {readCount > 0 ? `(${readCount})` : ''}
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium">No {activeTab} notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                                                 <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer border-b border-gray-100 ${
                    !notification.is_read ? 'bg-blue-50/50' : 'bg-gray-25'
                  }`}
                  onClick={() => navigateToNotification(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                                                     <p className={`text-sm font-semibold ${
                             !notification.is_read ? 'text-gray-900' : 'text-gray-500'
                           }`}>
                             {notification.message}
                           </p>
                           {/* Show description if available */}
                           {notification.description && (
                             <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                               {notification.description}
                             </p>
                           )}
                        </div>
                        <div className="flex flex-col items-end space-y-1 ml-2">
                          <span className="text-xs text-gray-400 font-mono">
                            {formatTimeAgo(notification.created_at)}
                          </span>

                        </div>
                      </div>
                      
                                             {/* Action Buttons */}
                       <div className="flex items-center justify-between mt-3">
                         <div className="flex items-center space-x-2">
                           {/* Show Read tag only if not a service request */}
                           {notification.is_read && notification.type !== 'service_order_created' && (
                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                               <CheckIcon className="h-3 w-3 mr-1" />
                               Read
                             </span>
                           )}
                           
                           {/* Action Buttons for Service Requests */}
                           {notification.type === 'service_order_created' && !notification.is_read && (
                             <>
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleServiceRequestAction(notification.id, 'accept');
                                 }}
                                 disabled={loadingStates[`accept-${notification.id}`]}
                                 className={`text-xs font-medium flex items-center px-2 py-1 rounded border transition-colors ${
                                   loadingStates[`accept-${notification.id}`]
                                     ? 'text-white bg-green-600 border-green-600 cursor-not-allowed'
                                     : 'text-white bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700'
                                 }`}
                               >
                                 {loadingStates[`accept-${notification.id}`] ? (
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
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleServiceRequestAction(notification.id, 'reject');
                                 }}
                                 disabled={loadingStates[`reject-${notification.id}`]}
                                 className={`text-xs font-medium flex items-center px-2 py-1 rounded border transition-colors ${
                                   loadingStates[`reject-${notification.id}`]
                                     ? 'text-white bg-red-600 border-red-600 cursor-not-allowed'
                                     : 'text-white bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700'
                                 }`}
                               >
                                 {loadingStates[`reject-${notification.id}`] ? (
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
                         </div>
                         <div className="flex items-center space-x-2">
                           {/* Hide Mark as read button when action buttons are shown */}
                           {!notification.is_read && notification.type !== 'service_order_created' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                disabled={loadingStates[`read-${notification.id}`]}
                                className={`text-xs font-medium flex items-center px-2 py-1 rounded border transition-colors ${
                                  loadingStates[`read-${notification.id}`]
                                    ? 'text-blue-400 bg-blue-25 border-blue-100 cursor-not-allowed'
                                    : 'text-blue-600 hover:text-blue-800 bg-blue-50 border-blue-200 hover:bg-blue-100'
                                }`}
                              >
                                {loadingStates[`read-${notification.id}`] ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                                    <span>Marking...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckIcon className="h-3 w-3 mr-1" />
                                    Mark read
                                  </>
                                )}
                              </button>
                            )}
                                                       <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              disabled={loadingStates[`remove-${notification.id}`]}
                              className={`p-1 rounded-full transition-all duration-200 ${
                                loadingStates[`remove-${notification.id}`]
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              }`}
                              title="Remove notification"
                            >
                              {loadingStates[`remove-${notification.id}`] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                              ) : (
                                <XMarkIcon className="h-4 w-4" />
                              )}
                            </button>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Auto-refresh {autoRefresh ? 'enabled' : 'disabled'}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/dashboard/notifications');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </button>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`text-xs px-2 py-1 rounded ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {autoRefresh ? 'Disable' : 'Enable'} Auto
                </button>
                <button
                  onClick={handleRefresh}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Refresh now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 