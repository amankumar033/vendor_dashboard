'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface VendorProfile {
  vendor_id: string;
  vendor_name: string;
  business_registration_number: string | null;
  vendor_description: string | null;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  years_in_business: number | null;
  hourly_rate: number | null;
  service_area_radius: number | null;
  is_certified: boolean;
  certification_details: string | null;
  insurance_coverage: string | null;
  insurance_details: string | null;
  average_rating: number;
  total_reviews: number;
  availability: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export default function ProfileManagement() {
  const { token, vendor } = useAuth();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalServices, setTotalServices] = useState<number>(0);

  useEffect(() => {
    fetchProfile();
    fetchTotalServices();
  }, [token, vendor]);

  const fetchProfile = async () => {
    try {
      console.log('🔍 Fetching profile with token:', token ? 'Token exists' : 'No token');
      console.log('🔍 Vendor data from context:', vendor);
      
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🔍 Profile API response status:', response.status);
      console.log('🔍 Profile API response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile data received:', data);
        setProfile(data.vendor);
      } else {
        console.error('❌ Profile fetch failed:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('❌ Error data:', errorData);
        
        // If profile fetch fails, try to use vendor data from context
        if (vendor) {
          console.log('🔄 Using vendor data from context as fallback');
          setProfile(vendor);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      
      // If there's an error, try to use vendor data from context
      if (vendor) {
        console.log('🔄 Using vendor data from context as fallback');
        setProfile(vendor);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalServices = async () => {
    if (!vendor?.vendor_id) return;
    try {
      const response = await fetch(`/api/services?vendor_id=${vendor.vendor_id}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.services)) {
        setTotalServices(data.services.length);
      } else {
        setTotalServices(0);
      }
    } catch (error) {
      setTotalServices(0);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl sm:text-2xl">
                {profile?.vendor_name ? profile.vendor_name.charAt(0).toUpperCase() : 'V'}
              </span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-900">{profile?.vendor_name || 'Vendor Profile'}</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">{profile?.contact_email || 'No email provided'}</p>
              <div className="flex items-center justify-center sm:justify-start mt-2">
                <span className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${
                  profile?.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profile?.is_active ? 'Active Account' : 'Inactive Account'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Average Rating</p>
              <p className="text-base sm:text-lg xl:text-xl font-semibold text-gray-900">
                {profile?.average_rating ? `${profile.average_rating}/5` : 'No ratings'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Reviews</p>
              <p className="text-base sm:text-lg xl:text-xl font-semibold text-gray-900">{profile?.total_reviews || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Years in Business</p>
              <p className="text-base sm:text-lg xl:text-xl font-semibold text-gray-900">{profile?.years_in_business || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <WrenchScrewdriverIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Services</p>
              <p className="text-base sm:text-lg xl:text-xl font-semibold text-gray-900">{totalServices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Profile Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-4 sm:py-5 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center justify-center sm:justify-start">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Vendor Profile
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor ID</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 font-mono">
                {profile?.vendor_id || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.vendor_name || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration Number</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.business_registration_number || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.contact_email || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.contact_phone || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.city || 'Not provided'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.business_address || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.postal_code || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.years_in_business || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certification Status</label>
              <div className="mt-1">
                <span className={`px-3 py-1 inline-flex text-xs sm:text-sm font-semibold rounded-full ${
                  profile?.is_certified 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {profile?.is_certified ? 'Certified' : 'Not Certified'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Average Rating</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.average_rating ? `${profile.average_rating}/5` : 'No ratings'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Reviews</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.total_reviews || 0}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.availability || 'Not specified'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
              <div className="mt-1">
                <span className={`px-3 py-1 inline-flex text-xs sm:text-sm font-semibold rounded-full ${
                  profile?.is_active 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {profile?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Not available'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Not available'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 min-h-[60px]">
                {profile?.vendor_description || 'Not provided'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Certification Details</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 min-h-[60px]">
                {profile?.certification_details || 'Not provided'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 