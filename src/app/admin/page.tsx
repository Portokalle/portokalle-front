"use client";

import { UsersTable } from '@/presentation/components/admin/UsersTable';
import { UserSidepanel } from '@/presentation/components/admin/UserSidepanel';
import { StatsCards } from '@/presentation/components/admin/StatsCards';
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
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{t('users')}</h2>
            <UsersTable />
          </section>
          <UserSidepanel />
          <section>
            <h2 className="text-xl font-semibold mb-2">{t('stats')}</h2>
            <StatsCards />
          </section>
        </div>
      </DashboardShell>
    </ToastProvider>
  );
}
