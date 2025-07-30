'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PincodesManagement from '@/components/PincodesManagement';
import DashboardLayout from '@/components/DashboardLayout';

export default function PincodesPage() {
  const { vendor, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !vendor) {
      router.push('/');
    }
  }, [vendor, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return null; // Will redirect to login
  }

  return (
    <DashboardLayout>
      <PincodesManagement />
    </DashboardLayout>
  );
} 