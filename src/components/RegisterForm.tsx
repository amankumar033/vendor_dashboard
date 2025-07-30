'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import RichTextEditor from './RichTextEditor';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    vendor_name: '',
    contact_email: '',
    password: '',
    confirmPassword: '',
    contact_phone: '',
    business_address: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    years_in_business: '',
    hourly_rate: '',
    service_area_radius: '',
    is_certified: false,
    certification_details: '',
    insurance_coverage: '',
    insurance_details: '',
    availability: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleRichTextChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_name: formData.vendor_name,
          contact_email: formData.contact_email,
          password: formData.password,
          contact_phone: formData.contact_phone,
          business_address: formData.business_address,
          city: formData.city,
          state_province: formData.state_province,
          postal_code: formData.postal_code,
          country: formData.country,
          years_in_business: formData.years_in_business ? parseInt(formData.years_in_business) : null,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          service_area_radius: formData.service_area_radius ? parseFloat(formData.service_area_radius) : null,
          is_certified: formData.is_certified,
          certification_details: formData.certification_details,
          insurance_coverage: formData.insurance_coverage,
          insurance_details: formData.insurance_details,
          availability: formData.availability
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login after successful registration
      await login(formData.contact_email, formData.password);

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Join Our Platform
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Create your vendor account and start growing your business
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              </div>

              <div>
                <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="vendor_name"
                    name="vendor_name"
                    type="text"
                    required
                    value={formData.vendor_name}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter business name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    required
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    required
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="business_address" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="business_address"
                    name="business_address"
                    type="text"
                    required
                    value={formData.business_address}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter business address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label htmlFor="state_province" className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province *
                </label>
                <input
                  id="state_province"
                  name="state_province"
                  type="text"
                  required
                  value={formData.state_province}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter state/province"
                />
              </div>

              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <input
                  id="postal_code"
                  name="postal_code"
                  type="text"
                  required
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter postal code"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter country"
                />
              </div>

              {/* Business Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
              </div>

              <div>
                <label htmlFor="years_in_business" className="block text-sm font-medium text-gray-700 mb-2">
                  Years in Business
                </label>
                <input
                  id="years_in_business"
                  name="years_in_business"
                  type="number"
                  min="0"
                  value={formData.years_in_business}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter years in business"
                />
              </div>

              <div>
                <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate ($)
                </label>
                <input
                  id="hourly_rate"
                  name="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter hourly rate"
                />
              </div>

              <div>
                <label htmlFor="service_area_radius" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Area Radius (miles)
                </label>
                <input
                  id="service_area_radius"
                  name="service_area_radius"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.service_area_radius}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter service area radius"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="is_certified"
                  name="is_certified"
                  type="checkbox"
                  checked={formData.is_certified}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="is_certified" className="ml-2 block text-sm text-gray-900">
                  I am certified in my field
                </label>
              </div>

              {formData.is_certified && (
                <div className="md:col-span-2">
                  <label htmlFor="certification_details" className="block text-sm font-medium text-gray-700 mb-2">
                    Certification Details
                  </label>
                  <RichTextEditor
                    value={formData.certification_details}
                    onChange={(value) => handleRichTextChange('certification_details', value)}
                    placeholder="Describe your certifications"
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <label htmlFor="insurance_coverage" className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Coverage
                </label>
                <input
                  id="insurance_coverage"
                  name="insurance_coverage"
                  type="text"
                  value={formData.insurance_coverage}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                  placeholder="Type of insurance coverage"
                />
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <input
                  id="availability"
                  name="availability"
                  type="text"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-gray-400"
                  placeholder="e.g., Weekdays 8AM-6PM"
                />
              </div>

              {formData.insurance_coverage && (
                <div className="md:col-span-2">
                  <label htmlFor="insurance_details" className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Details
                  </label>
                  <RichTextEditor
                    value={formData.insurance_details}
                    onChange={(value) => handleRichTextChange('insurance_details', value)}
                    placeholder="Describe your insurance coverage"
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-8">
            <div className="mb-8">
              <svg className="mx-auto h-24 w-24 text-white opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Join Our Platform
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Connect with customers and grow your business
            </p>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">🚀</div>
                <p className="text-sm opacity-80">Grow</p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">💰</div>
                <p className="text-sm opacity-80">Earn</p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">📈</div>
                <p className="text-sm opacity-80">Scale</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white opacity-10 rounded-full"></div>
      </div>
    </div>
  );
} 