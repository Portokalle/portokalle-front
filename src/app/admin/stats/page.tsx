"use client";

import { ToastProvider } from '@/presentation/components/admin/ToastProvider';
import DashboardShell from '@/presentation/components/DashboardShell';
import { StatsCards } from '@/presentation/components/admin/StatsCards';
import { useTranslation } from 'react-i18next';
import '@i18n';

export default function AdminStatsPage() {
  const { t } = useTranslation();
  return (
    <ToastProvider>
      <DashboardShell>
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold mb-4">{t('stats')}</h1>
          <StatsCards />
        </div>
      </DashboardShell>
    </ToastProvider>
  );
}
