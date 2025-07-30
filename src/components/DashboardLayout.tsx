'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  HomeIcon, 
  WrenchScrewdriverIcon, 
  ClipboardDocumentListIcon,
  UserIcon,
  MapPinIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Squares2X2Icon,
  UserGroupIcon,
  CubeIcon,
  CogIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  ArrowPathIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon, description: 'Overview and analytics' },
  { name: 'Services', href: '/dashboard/services', icon: CogIcon, description: 'Service offerings' },
  { name: 'Service Orders', href: '/dashboard/service-orders', icon: CogIcon, description: 'Service order management' },
  { name: 'Pincodes', href: '/dashboard/pincodes', icon: MapPinIcon, description: 'Service area management' },
  { name: 'Profile', href: '/dashboard/profile', icon: UserIcon, description: 'Account settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { vendor, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (!vendor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 mr-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            
            {/* Logo */}
            <div className="flex items-center">
              <Squares2X2Icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">Vendor Panel</span>
            </div>
          </div>

          {/* Dashboard Title - Hidden on mobile */}
          <div className="hidden sm:flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {pathname === '/dashboard' && 'Dashboard'}
            </h1>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notification button - Hidden on mobile */}
            <button className="hidden sm:block relative p-2 text-gray-600 hover:text-gray-900">
              <BellIcon className="h-6 w-6" />
            </button>
            
            {/* User info - Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* User details - Hidden on mobile */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{vendor?.vendor_name || 'Vendor'}</p>
                <p className="text-xs text-gray-500">{vendor?.contact_email || 'vendor@example.com'}</p>
              </div>
              
              {/* User avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-xs sm:text-sm">
                  {vendor?.vendor_name ? vendor.vendor_name.charAt(0).toUpperCase() : 'V'}
                </span>
              </div>
              
              {/* Logout button - Hidden on mobile */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={closeMobileMenu} />
          
          {/* Mobile menu panel */}
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Mobile menu header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  <Squares2X2Icon className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">Menu</span>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm border border-gray-200 transition-all duration-200"
                  onClick={closeMobileMenu}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Mobile navigation */}
              <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className={`mr-4 h-6 w-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <div>
                        <div className="font-medium text-base">{item.name}</div>
                        <div className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                          {item.description}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </nav>

              {/* Mobile user info and logout */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {vendor?.vendor_name ? vendor.vendor_name.charAt(0).toUpperCase() : 'V'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vendor?.vendor_name || 'Vendor'}</p>
                    <p className="text-xs text-gray-500">{vendor?.contact_email || 'vendor@example.com'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop only */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-lg" style={{ top: '72px' }}>
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-3 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-4 text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-4 h-6 w-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <div>
                    <div className="font-medium text-base">{item.name}</div>
                    <div className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                      {item.description}
                    </div>
                  </div>
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-80" style={{ paddingTop: '72px' }}>
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 