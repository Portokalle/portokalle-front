"use client";

import { ToastProvider } from '@/presentation/components/admin/ToastProvider';
import DashboardShell from '@/presentation/components/DashboardShell';
import { useTranslation } from 'react-i18next';
import '@i18n';

export default function AdminPage() {
  const { t } = useTranslation();
  return (
    <ToastProvider>
      {/* Reuse the dashboard shell (sidebar + header) for consistent theme */}
      <DashboardShell>
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold mb-4">{t('adminDashboard')}</h1>
        </div>
      </DashboardShell>
    </ToastProvider>
  );
}
