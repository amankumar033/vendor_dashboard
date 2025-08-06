'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Vendor {
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  vendor: Vendor | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('vendor_token');
    const savedVendor = localStorage.getItem('vendor_data');
    
    if (savedToken && savedVendor) {
      setToken(savedToken);
      setVendor(JSON.parse(savedVendor));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return false;
      }

      setToken(data.token);
      setVendor(data.vendor);
      
      // Save to localStorage
      localStorage.setItem('vendor_token', data.token);
      localStorage.setItem('vendor_data', JSON.stringify(data.vendor));
      
      return true;
    } catch (err) {
      setError('Network error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setVendor(null);
    localStorage.removeItem('vendor_token');
    localStorage.removeItem('vendor_data');
  };

  return (
    <AuthContext.Provider value={{ vendor, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 