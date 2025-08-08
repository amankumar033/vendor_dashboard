import { Metadata } from 'next';
import DashboardLayout from '@/components/DashboardLayout';
import ServiceCategoriesManagement from '@/components/ServiceCategoriesManagement';

export const metadata: Metadata = {
  title: 'Service Categories - Vendor Dashboard',
  description: 'Manage your service categories and view service counts',
};

export default function ServiceCategoriesPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <ServiceCategoriesManagement />
      </div>
    </DashboardLayout>
  );
} 