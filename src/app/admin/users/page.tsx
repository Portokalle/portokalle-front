"use client";

import { ToastProvider } from '@/presentation/components/admin/ToastProvider';
import DashboardShell from '@/presentation/components/DashboardShell';
import { UsersTable } from '@/presentation/components/admin/UsersTable';
import { useTranslation } from 'react-i18next';
import '@i18n';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  return (
    <ToastProvider>
      <DashboardShell>
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold mb-4">{t('users')}</h1>
          <UsersTable />
        </div>
      </DashboardShell>
    </ToastProvider>
  );
}
