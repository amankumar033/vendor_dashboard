'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiPlus, FiClipboard, FiUser } from 'react-icons/fi';
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
  UserIcon,
  ClipboardDocumentCheckIcon ,
  CubeIcon,
  ShoppingBagIcon,
  CurrencyEuroIcon,
  ClipboardIcon,


} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalServices: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface RecentService {
  service_id: string;
  vendor_id: string;
  name: string;
  description: string;
  service_category_id: string;
  category_name?: string;
  type: string;
  base_price: number;
  duration_minutes: number;
  is_available: boolean;
  service_pincodes: string;
}

interface RecentServiceOrder {
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
    console.log('DashboardOverview - Vendor data:', vendor);
    if (vendor?.vendor_id) {
      console.log('Fetching data for vendor ID:', vendor.vendor_id);
      fetchStats();
      fetchRecentServices();
      fetchRecentServiceOrders();
    } else {
      console.log('No vendor ID available, vendor object:', vendor);
    }
  }, [vendor]);

  const fetchStats = async () => {
    try {
      if (!vendor?.vendor_id) {
        setError('No vendor ID available');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`/api/dashboard-stats?vendor_id=${vendor.vendor_id}`);
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
      if (!vendor?.vendor_id) {
        return;
      }
      
      const response = await fetch(`/api/recent-services?vendor_id=${vendor.vendor_id}&limit=3`);
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
      if (!vendor?.vendor_id) {
        return;
      }
      
      const response = await fetch(`/api/recent-service-orders?vendor_id=${vendor.vendor_id}&limit=3`);
      const data = await response.json();
      console.log('Recent Service Orders Data:', data);
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
      {/* Stats Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
  {/* Total Services */}
  <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-100 border border-transparent hover:border-blue-200 dashboard-card-hover">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-700 text-sm transition-colors duration-300">Total Services</p>
        <h3 className="text-xl lg:text-2xl font-bold mt-1 text-black transition-colors duration-300">
          {stats?.totalServices || 0}
        </h3>
      </div>
      <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 transition-all duration-300 hover:scale-110 hover:shadow-lg">
        <WrenchScrewdriverIcon className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 hover:rotate-12" />
      </div>
    </div>
    <p className="text-sm text-gray-500 mt-3 transition-colors duration-300">
      <span className="text-blue-600 font-medium">+12% from last month</span>
    </p>
  </div>

  {/* Service Bookings */}
  <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-100 border border-transparent hover:border-green-200 dashboard-card-hover">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-700 text-sm transition-colors duration-300">Service Bookings</p>
        <h3 className="text-xl lg:text-2xl font-bold mt-1 text-black transition-colors duration-300">
          {stats?.totalOrders || 0}
        </h3>
       
      </div>
      <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 text-green-600 transition-all duration-300 hover:scale-110 hover:shadow-lg">
        <ClipboardDocumentListIcon className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 hover:rotate-12" />
      </div>
    </div>
    <p className="text-sm text-gray-500 mt-3 transition-colors duration-300">
      <span className="text-green-600 font-medium">+15% from last month</span>
    </p>
  </div>

  {/* Completed Orders */}
  <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-100 border border-transparent hover:border-purple-200 dashboard-card-hover">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-700 text-sm transition-colors duration-300">Completed</p>
        <h3 className="text-xl lg:text-2xl font-bold mt-1 text-black transition-colors duration-300">
          {stats?.completedOrders || 0}
        </h3>
      </div>
      <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 transition-all duration-300 hover:scale-110 hover:shadow-lg">
        <CheckCircleIcon className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 hover:rotate-12" />
      </div>
    </div>
    <p className="text-sm text-gray-500 mt-3 transition-colors duration-300">
      <span className="text-purple-600 font-medium">Successfully Delivered</span>
    </p>
  </div>

  {/* Total Revenue */}
  <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-100 border border-transparent hover:border-yellow-200 dashboard-card-hover">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-700 text-sm transition-colors duration-300">Total Revenue</p>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 text-black transition-colors duration-300">
          {formatCurrency(stats?.totalRevenue || 0)}
        </h3>
      </div>
      <div className="p-2 lg:p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600 transition-all duration-300 hover:scale-110 hover:shadow-lg">
        <CurrencyDollarIcon className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 hover:rotate-12" />
      </div>
    </div>
    <p className="text-sm text-gray-500 mt-3 transition-colors duration-300">
      <span className="text-yellow-600 font-medium">Lifetime Earnings</span>
    </p>
  </div>
</div>

      {/* Recent Activity Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-9">
  {/* Recent Service Orders - Floating Card */}
  <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100/80 p-7 sm:p-9 
      transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hover:duration-500
      hover:shadow-2xl hover:border-orange-200/60 hover:-translate-y-2
      group/card hover:bg-gradient-to-br hover:from-white/95 hover:via-orange-50/20 hover:to-white/95
      transform-style-preserve-3d perspective-1500 hover:rotate-x-[0.8deg] hover:rotate-y-[0.8deg]
      before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-orange-100/0 before:to-amber-100/0 
      before:opacity-0 before:transition-all before:duration-1000 before:ease-in-out
      hover:before:opacity-100 hover:before:scale-x-105 hover:before:scale-y-110
      after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none
      after:shadow-[0_5px_60px_-15px_rgba(249,115,22,0.3)] after:opacity-0
      after:transition-all after:duration-1000 after:ease-out
      hover:after:opacity-100 hover:after:scale-105">
    
    {/* Floating Header */}
    <div className="relative z-10 flex items-center justify-between mb-8 transform transition-all duration-700 ease-out group-hover/card:translate-y-1.5">
      <div className="space-y-2">
        <h3 className="text-2xl sm:text-2.5xl font-bold text-gray-900 
            transition-all duration-1000 ease-[cubic-bezier(0.2,0,0,1)] 
            group-hover/card:text-gray-800 group-hover/card:tracking-tight
            [text-shadow:0_1px_2px_rgba(0,0,0,0.03)] group-hover/card:[text-shadow:0_2px_4px_rgba(0,0,0,0.05)]">
          Recent Service Orders
        </h3>
        <p className="text-sm text-gray-400/90 
            transition-all duration-1200 ease-[cubic-bezier(0.5,0,0,1)]
            group-hover/card:text-gray-500/90 group-hover/card:translate-x-1.5
            group-hover/card:opacity-100">
          Latest service bookings
        </p>
      </div>
      <div className="p-3.5 bg-orange-100/80 rounded-2xl backdrop-blur-[6px]
          transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          group-hover/card:scale-110 group-hover/card:bg-orange-200/90
          group-hover/card:shadow-[0_8px_20px_-6px_rgba(249,115,22,0.3)]
          shadow-[0_4px_12px_-4px_rgba(249,115,22,0.2)]">
        <ClipboardDocumentCheckIcon className="h-7 w-7 text-orange-600/90 
            transition-all duration-700 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]
            group-hover/card:rotate-8 group-hover/card:scale-110
            group-hover/card:[filter:drop-shadow(0_2px_4px_rgba(249,115,22,0.3))]" />
      </div>
    </div>
    
    {/* Floating Order Items */}
    <div className="relative z-10 space-y-6">
      {recentServiceOrders.length > 0 ? (
        recentServiceOrders.map((order, index) => (
          <div 
            key={order.service_order_id}
            className={`relative flex items-center gap-6 p-5 rounded-2xl backdrop-blur-[4px]
              bg-white/90 border border-gray-100/70 shadow-xs
              transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:duration-300
              hover:shadow-sm hover:-translate-y-1.5 hover:border-orange-200/60
              hover:bg-orange-50/50 hover:scale-[1.015]
              transform-style-preserve-3d hover:rotate-y-1.5
              group/item will-change-transform
              before:absolute before:inset-0 before:rounded-2xl before:bg-orange-100/0 
              before:transition-all before:duration-500 before:ease-out
              hover:before:bg-orange-100/20 hover:before:scale-105`}
            style={{ 
              transitionDelay: `${index * 100}ms`,
              transform: 'translateZ(0)' // Force GPU acceleration
            }}
          >
            {/* Animated Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-orange-400/95 to-amber-500/95 
                  rounded-2xl flex items-center justify-center shadow-lg
                  transition-all duration-900 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  group-hover/item:scale-110 group-hover/item:rotate-3
                  group-hover/card:translate-y-2
                  [box-shadow:0_4px_12px_-2px_rgba(249,115,22,0.4)]">
                <ShoppingBagIcon className="h-4 w-4 text-white/95 
                    transition-all duration-600 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]
                    group-hover/item:rotate-12 group-hover/item:scale-110
                    group-hover/item:[filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.15))]" />
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full p-1 shadow-xs border border-gray-100/80
                  transition-all duration-500 ease-out group-hover/item:scale-125 group-hover/item:-rotate-12">
                <span className="block w-3 h-3 bg-green-400 rounded-full border-[2.5px] border-white
                    animate-pulse [animation-duration:1.5s] group-hover/item:animate-none 
                    group-hover/item:bg-green-500/95 transition-all duration-300"></span>
              </span>
            </div>
            
            {/* Content with staggered hover */}
            <div className="flex-1 min-w-0 space-y-1.5 transition-all duration-800 ease-out group-hover/item:translate-x-2">
              <p className="text-base sm:text-[1.05rem] font-semibold text-gray-800/95 truncate
                  transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]
                  group-hover/item:text-gray-900 group-hover/item:tracking-tight
                  group-hover/item:[text-shadow:0_1px_2px_rgba(0,0,0,0.03)]">
                Service #{order.service_order_id}
              </p>
              <p className="text-sm text-gray-400/90 truncate 
                  transition-all duration-700 ease-[cubic-bezier(0.5,0,0,1)]
                  group-hover/item:text-gray-500/90 group-hover/item:translate-x-1
                  group-hover/item:opacity-100">
                {order.service_name}
              </p>
            </div>
            
            {/* Price with floating effect */}
            <div className="text-right flex-shrink-0 space-y-2 
                transition-all duration-900 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                group-hover/item:translate-y-2">
              <p className="text-base font-semibold text-gray-800/95 
                  transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]
                  group-hover/item:text-gray-900
                  group-hover/item:[text-shadow:0_1px_2px_rgba(0,0,0,0.03)]">
                {formatCurrency(order.final_price)}
              </p>
              <div className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  group-hover/item:scale-115 group-hover/item:-translate-y-1">
                {getStatusBadge(order.service_status)}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-7 rounded-2xl bg-gray-50/70 border border-gray-100/70
            transition-all duration-700 ease-out hover:bg-gray-100/60 hover:shadow-sm
            hover:-translate-y-0.5 hover:border-gray-200/80">
          <p className="text-sm text-gray-400/90 transition-all duration-500 ease-in-out 
              hover:text-gray-500/90 hover:scale-105">No recent service orders</p>
        </div>
      )}
    </div>
  </div>

  {/* Recent Services - Floating Card */}
  <div className=" relative bg-white rounded-3xl shadow-xl border border-gray-100/80 p-7 sm:p-9 
      transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hover:duration-500
      hover:shadow-2xl hover:border-indigo-200/60 hover:-translate-y-2
      group/card hover:bg-gradient-to-br hover:from-white/95 hover:via-indigo-50/20 hover:to-white/95
      transform-style-preserve-3d perspective-1500 hover:rotate-x-[0.8deg] hover:rotate-y-[0.8deg]
      before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-indigo-100/0 before:to-purple-100/0 
      before:opacity-0 before:transition-all before:duration-1000 before:ease-in-out
      hover:before:opacity-100 hover:before:scale-x-105 hover:before:scale-y-110
      after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none
      after:shadow-[0_5px_60px_-15px_rgba(79,70,229,0.3)] after:opacity-0
      after:transition-all after:duration-1000 after:ease-out
      hover:after:opacity-100 hover:after:scale-105">
    
    {/* Floating Header */}
    <div className="relative z-10 flex items-center justify-between mb-8 transform transition-all duration-700 ease-out group-hover/card:translate-y-1.5">
      <div className="space-y-2">
        <h3 className="text-2xl sm:text-2.5xl font-bold text-gray-900 
            transition-all duration-1000 ease-[cubic-bezier(0.2,0,0,1)] 
            group-hover/card:text-gray-800 group-hover/card:tracking-tight
            [text-shadow:0_1px_2px_rgba(0,0,0,0.03)] group-hover/card:[text-shadow:0_2px_4px_rgba(0,0,0,0.05)]">
          Recent Services
        </h3>
        <p className="text-sm text-gray-400/90 
            transition-all duration-1200 ease-[cubic-bezier(0.5,0,0,1)]
            group-hover/card:text-gray-500/90 group-hover/card:translate-x-1.5
            group-hover/card:opacity-100">
          Your latest service offerings
        </p>
      </div>
      <div className="p-3.5 bg-indigo-100/80 rounded-2xl backdrop-blur-[6px]
          transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          group-hover/card:scale-110 group-hover/card:bg-indigo-200/90
          group-hover/card:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.3)]
          shadow-[0_4px_12px_-4px_rgba(79,70,229,0.2)]">
        <CubeIcon className="h-7 w-7 text-indigo-600/90 
            transition-all duration-700 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]
            group-hover/card:-rotate-8 group-hover/card:scale-110
            group-hover/card:[filter:drop-shadow(0_2px_4px_rgba(79,70,229,0.3))]" />
      </div>
    </div>
    
    {/* Floating Service Items */}
    <div className="relative z-10 space-y-6">
      {recentServices.length > 0 ? (
        recentServices.map((service, index) => (
          <div 
            key={service.service_id}
            className={`relative flex items-center gap-6 p-5 rounded-2xl backdrop-blur-[4px]
              bg-white/90 border border-gray-100/70 shadow-xs
              transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:duration-300
              hover:shadow-sm hover:-translate-y-1.5 hover:border-indigo-200/60
              hover:bg-indigo-50/40 hover:scale-[1.015]
              transform-style-preserve-3d hover:rotate-y-1.5
              group/item will-change-transform
              before:absolute before:inset-0 before:rounded-2xl before:bg-indigo-100/0 
              before:transition-all before:duration-500 before:ease-out
              hover:before:bg-indigo-100/20 hover:before:scale-105`}
            style={{ 
              transitionDelay: `${index * 100}ms`,
              transform: 'translateZ(0)' // Force GPU acceleration
            }}
          >
            {/* Animated Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-indigo-400/95 to-purple-500/95 
                  rounded-2xl flex items-center justify-center shadow-lg
                  transition-all duration-900 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  group-hover/item:scale-110 group-hover/item:-rotate-3
                  group-hover/card:translate-y-2
                  [box-shadow:0_4px_12px_-2px_rgba(79,70,229,0.4)]">
                <WrenchScrewdriverIcon className="h-6 w-6 text-white/95 
                    transition-all duration-600 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]
                    group-hover/item:-rotate-12 group-hover/item:scale-110
                    group-hover/item:[filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.15))]" />
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full p-1 shadow-xs border border-gray-100/80
                  transition-all duration-500 ease-out group-hover/item:scale-125 group-hover/item:rotate-12">
                <span className="block w-3 h-3 bg-blue-400 rounded-full border-[2.5px] border-white
                    animate-pulse [animation-duration:1.5s] group-hover/item:animate-none 
                    group-hover/item:bg-blue-500/95 transition-all duration-300"></span>
              </span>
            </div>
            
            {/* Content with staggered hover */}
            <div className="flex-1 min-w-0 space-y-1.5 transition-all duration-800 ease-out group-hover/item:translate-x-2">
              <p className="text-base sm:text-[1.05rem] font-semibold text-gray-800/95 truncate
                  transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]
                  group-hover/item:text-gray-900 group-hover/item:tracking-tight
                  group-hover/item:[text-shadow:0_1px_2px_rgba(0,0,0,0.03)]">
                {service.name}
              </p>
              <p className="text-sm text-gray-400/90 truncate 
                  transition-all duration-700 ease-[cubic-bezier(0.5,0,0,1)]
                  group-hover/item:text-gray-500/90 group-hover/item:translate-x-1
                  group-hover/item:opacity-100">
                                        {service.category_name || service.service_category_id} • {service.duration_minutes} min
              </p>
            </div>
            
            {/* Price with floating effect */}
            <div className="text-right flex-shrink-0 space-y-2 
                transition-all duration-900 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                group-hover/item:translate-y-2">
              <p className="text-base font-semibold text-gray-800/95 
                  transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]
                  group-hover/item:text-gray-900
                  group-hover/item:[text-shadow:0_1px_2px_rgba(0,0,0,0.03)]">
                {formatCurrency(service.base_price)}
              </p>
              <div className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  group-hover/item:scale-115 group-hover/item:-translate-y-1">
                {getAvailabilityBadge(service.is_available)}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-7 rounded-2xl bg-gray-50/70 border border-gray-100/70
            transition-all duration-700 ease-out hover:bg-gray-100/60 hover:shadow-sm
            hover:-translate-y-0.5 hover:border-gray-200/80">
          <p className="text-sm text-gray-400/90 transition-all duration-500 ease-in-out 
              hover:text-gray-500/90 hover:scale-105">No recent services</p>
        </div>
      )}
    </div>
  </div>
</div>



      {/* Quick Actions */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {/* Add New Service */}
  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 
      transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
      hover:shadow-lg hover:-translate-y-1.5 hover:border-blue-200/70
      group cursor-pointer">
    <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 bg-blue-100 rounded-full mx-auto mb-3 sm:mb-4
        transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        group-hover:scale-105 group-hover:bg-blue-200/80">
      <PlusIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 
          transition-transform duration-500 group-hover:rotate-90" />
    </div>
    <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-2
        transition-colors duration-300 group-hover:text-blue-700">
      Add New Service
    </h3>
    <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4
        transition-colors duration-400 group-hover:text-gray-700">
      Create a new service offering for your customers
    </p>
    <button 
      onClick={() => handleNavigation('/dashboard/services')}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 
          transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5
          text-sm sm:text-base"
    >
      Create Service
    </button>
  </div>

  {/* Manage Orders */}
  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 
      transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
      hover:shadow-lg hover:-translate-y-1.5 hover:border-green-200/70
      group cursor-pointer">
    <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 bg-green-100 rounded-full mx-auto mb-3 sm:mb-4
        transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        group-hover:scale-105 group-hover:bg-green-200/80">
      <ClipboardDocumentListIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 
          transition-transform duration-500 group-hover:rotate-6" />
    </div>
    <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-2
        transition-colors duration-300 group-hover:text-green-700">
      Manage Orders
    </h3>
    <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4
        transition-colors duration-400 group-hover:text-gray-700">
      View and manage your service bookings
    </p>
    <button 
      onClick={() => handleNavigation('/dashboard/service-orders')}
      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 
          transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5
          text-sm sm:text-base"
    >
      View Orders
    </button>
  </div>

  {/* Update Profile */}
  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 
      transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
      hover:shadow-lg hover:-translate-y-1.5 hover:border-purple-200/70
      group cursor-pointer sm:col-span-2 lg:col-span-1">
    <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 bg-purple-100 rounded-full mx-auto mb-3 sm:mb-4
        transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        group-hover:scale-105 group-hover:bg-purple-200/80">
      <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 
          transition-transform duration-500 group-hover:scale-110" />
    </div>
    <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-2
        transition-colors duration-300 group-hover:text-purple-700">
      Update Profile
    </h3>
    <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4
        transition-colors duration-400 group-hover:text-gray-700">
      Manage your business information and settings
    </p>
    <button 
      onClick={() => handleNavigation('/dashboard/profile')}
      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 
          transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5
          text-sm sm:text-base"
    >
      Edit Profile
    </button>
  </div>
</div>
    </div>
  );
} 