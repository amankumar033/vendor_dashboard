'use client';

import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import ServiceOrdersManagement from '@/components/ServiceOrdersManagement';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ServiceOrdersPage() {
  const { vendor, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !vendor) {
      router.push('/');
    }
  }, [vendor, isLoading, router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!vendor) {
    return null;
  }

  return (
    <DashboardLayout>
      <ServiceOrdersManagement />
    </DashboardLayout>
  );
} 