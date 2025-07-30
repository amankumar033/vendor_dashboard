'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  WrenchScrewdriverIcon, 
  ClipboardDocumentListIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  StarIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  MapPinIcon,
  PlusIcon,
  CogIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalServices: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface RecentService {
  service_id: number;
  vendor_id: number;
  name: string;
  description: string;
  category: string;
  type: string;
  base_price: number;
  duration_minutes: number;
  is_available: boolean;
  service_pincodes: string;
}

interface RecentServiceOrder {
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
  was_available: boolean;
}

export default function DashboardOverview() {
  const { vendor } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentServices, setRecentServices] = useState<RecentService[]>([]);
  const [recentServiceOrders, setRecentServiceOrders] = useState<RecentServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vendor?.vendor_id) {
      fetchStats();
      fetchRecentServices();
      fetchRecentServiceOrders();
    }
  }, [vendor]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/dashboard-stats?vendor_id=${vendor?.vendor_id}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError('Failed to fetch dashboard statistics');
      }
    } catch (err) {
      setError('Error fetching dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentServices = async () => {
    try {
      const response = await fetch(`/api/recent-services?vendor_id=${vendor?.vendor_id}&limit=3`);
      const data = await response.json();
      
      if (data.success) {
        setRecentServices(data.recentServices);
      }
    } catch (err) {
      console.error('Error fetching recent services:', err);
    }
  };

  const fetchRecentServiceOrders = async () => {
    try {
      const response = await fetch(`/api/recent-service-orders?vendor_id=${vendor?.vendor_id}&limit=3`);
      const data = await response.json();
      
      if (data.success) {
        setRecentServiceOrders(data.recentServiceOrders);
      }
    } catch (err) {
      console.error('Error fetching recent service orders:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'confirmed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      'in_progress': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'In Progress' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };
    
    const statusConfig = statusMap[status] || statusMap['pending'];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text} rounded-full`}>
        {statusConfig.label}
      </span>
    );
  };

  const getAvailabilityBadge = (isAvailable: boolean) => {
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
        isAvailable 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isAvailable ? 'Available' : 'Unavailable'}
      </span>
    );
  };

  const handleNavigation = (path: string) => {
    router.push(path);
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Services */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <WrenchScrewdriverIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Services</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.totalServices || 0}</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center text-xs sm:text-sm text-green-600">
              <span className="font-medium">+12% from last month</span>
            </div>
          </div>
        </div>

        {/* Service Bookings */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Service Bookings</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">+ 7 services</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center text-xs sm:text-sm text-green-600">
              <span className="font-medium">+15% from last month</span>
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Completed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.completedOrders || 0}</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center text-xs sm:text-sm text-green-600">
              <span className="font-medium">Successfully Delivered</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalRevenue || 0)}</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center text-xs sm:text-sm text-green-600">
              <span className="font-medium">Lifetime Earnings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Service Orders */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Recent Service Orders</h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-4">Latest service bookings</p>
          <div className="space-y-3">
            {recentServiceOrders.length > 0 ? (
              recentServiceOrders.map((order) => (
                <div key={order.service_order_id} className="flex items-center space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <WrenchScrewdriverIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Service #{order.service_order_id}</p>
                    <p className="text-xs text-gray-500 truncate">{order.service_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{formatCurrency(order.final_price)}</p>
                    {getStatusBadge(order.service_status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-xs sm:text-sm text-gray-500">No recent service orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Services */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Recent Services</h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-4">Your latest service offerings</p>
          <div className="space-y-3">
            {recentServices.length > 0 ? (
              recentServices.map((service) => (
                <div key={service.service_id} className="flex items-center space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <WrenchScrewdriverIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{service.name}</p>
                    <p className="text-xs text-gray-500 truncate">{service.category} • {service.duration_minutes} min</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{formatCurrency(service.base_price)}</p>
                    {getAvailabilityBadge(service.is_available)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-xs sm:text-sm text-gray-500">No recent services</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Add New Service */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 bg-blue-100 rounded-full mx-auto mb-3 sm:mb-4">
            <PlusIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-2">Add New Service</h3>
          <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4">Create a new service offering for your customers</p>
          <button 
            onClick={() => handleNavigation('/dashboard/services')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
          >
            Create Service
          </button>
        </div>

        {/* Manage Orders */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 bg-green-100 rounded-full mx-auto mb-3 sm:mb-4">
            <ClipboardDocumentListIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-2">Manage Orders</h3>
          <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4">View and manage your service bookings</p>
          <button 
            onClick={() => handleNavigation('/dashboard/service-orders')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm sm:text-base"
          >
            View Orders
          </button>
        </div>

        {/* Update Profile */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 bg-purple-100 rounded-full mx-auto mb-3 sm:mb-4">
            <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-2">Update Profile</h3>
          <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4">Manage your business information and settings</p>
          <button 
            onClick={() => handleNavigation('/dashboard/profile')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm sm:text-base"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
} 