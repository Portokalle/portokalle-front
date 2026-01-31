"use client";

import { ToastProvider } from '@/presentation/components/admin/ToastProvider';
import DashboardShell from '@/presentation/components/DashboardShell';
import { useTranslation } from 'react-i18next';
import '@i18n';
import { useEffect, useMemo, useState } from 'react';
import { useDI } from '@/presentation/context/DIContext';
import type { AdminUser } from '@/application/ports/IAdminGateway';
import { UserRole } from '@/domain/entities/UserRole';
import GenericTable, { Column } from '@/presentation/components/GenericTable';
import Modal from '@/presentation/components/Modal';

export default function AdminPage() {
  const { t } = useTranslation();
  const { adminGateway } = useDI();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminGateway.getAllUsers();
        if (!active) return;
        setUsers(data);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : t('failedToLoadUsers', 'Failed to load users'));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [adminGateway, t]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = `${u.name || ''} ${u.surname || ''}`.trim().toLowerCase();
      const email = (u.email || '').toLowerCase();
      const role = (u.role || '').toString().toLowerCase();
      return name.includes(q) || email.includes(q) || role.includes(q);
    });
  }, [users, search]);

  const columns: Column<AdminUser>[] = [
    { key: 'name', header: t('name', 'Name') },
    { key: 'surname', header: t('surname', 'Surname') },
    { key: 'email', header: t('email', 'Email') },
    { key: 'role', header: t('role', 'Role') },
    { key: 'approvalStatus', header: t('status', 'Status') },
  ];

  const handleSave = async (next: AdminUser) => {
    setSaving(true);
    try {
      const normalizedSpecializations = Array.isArray(next.specializations)
        ? next.specializations.filter((s) => s && s.trim().length > 0)
        : [];
      await adminGateway.updateUserFields({
        id: next.id,
        name: next.name,
        surname: next.surname,
        email: next.email,
        role: next.role,
        approvalStatus: next.approvalStatus,
      });
      if (next.role === UserRole.Doctor) {
        await adminGateway.updateDoctorFields(next.id, {
          specialization: normalizedSpecializations[0] ?? next.specialization,
          bio: next.bio,
          specializations: normalizedSpecializations,
        });
      }
      setUsers((prev) => prev.map((u) => (u.id === next.id ? { ...u, ...next, specializations: normalizedSpecializations } : u)));
      setSelected({ ...next, specializations: normalizedSpecializations });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('failedToSaveUser', 'Failed to save user'));
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (user: AdminUser) => {
    setResetLoading(true);
    setError(null);
    try {
      const link = await adminGateway.generatePasswordResetLink(user.id);
      if (!link) {
        throw new Error(t('failedToResetPassword', 'Failed to generate reset link'));
      }
      setResetLink(link);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('failedToResetPassword', 'Failed to generate reset link'));
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    setResetLink(null);
  }, [selected?.id]);

  return (
    <ToastProvider>
      {/* Reuse the dashboard shell (sidebar + header) for consistent theme */}
      <DashboardShell>
        <div className="admin-page">
          <h1 className="admin-page-title mb-4">{t('adminDashboard')}</h1>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <input
              type="text"
              className="admin-search-input"
              placeholder={t('searchUsers', 'Search users...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {error && <div className="text-red-600 mb-3">{error}</div>}
          <div className="admin-users-table">
            <GenericTable
              data={filteredUsers}
              columns={columns}
              loading={loading}
              page={page}
              pageSize={20}
              onPageChange={setPage}
              emptyText={t('noUsersFound', 'No users found')}
              actions={[
                {
                  label: t('edit', 'Edit'),
                  onClick: (row) => setSelected(row),
                },
              ]}
            />
          </div>
          <Modal
            isOpen={!!selected}
            onClose={() => setSelected(null)}
            overlayClassName="admin-user-modal-overlay"
            panelClassName="admin-user-modal"
            showCloseButton={false}
          >
            <div className="admin-user-modal-header">
              <h2 className="text-lg font-semibold">{t('editUser', 'Edit user')}</h2>
              <button className="admin-user-btn-close" onClick={() => setSelected(null)}>
                {t('close', 'Close')}
              </button>
            </div>
            {selected && (
              <UserEditSidebar
                user={selected}
                onChange={setSelected}
                onSave={handleSave}
                onResetPassword={handleResetPassword}
                saving={saving}
                resetLoading={resetLoading}
                resetLink={resetLink}
              />
            )}
          </Modal>
        </div>
      </DashboardShell>
    </ToastProvider>
  );
}

function UserEditSidebar({
  user,
  onChange,
  onSave,
  onResetPassword,
  saving,
  resetLoading,
  resetLink,
}: {
  user: AdminUser;
  onChange: (next: AdminUser) => void;
  onSave: (next: AdminUser) => void;
  onResetPassword: (user: AdminUser) => void;
  saving: boolean;
  resetLoading: boolean;
  resetLink: string | null;
}) {
  const specializations = Array.isArray(user.specializations) && user.specializations.length > 0
    ? user.specializations
    : (user.specialization ? [user.specialization] : []);

  const updateSpecializations = (next: string[]) => {
    onChange({
      ...user,
      specializations: next,
      specialization: next[0] ?? '',
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="label"><span className="label-text">Name</span></label>
        <input
          className="input input-bordered w-full"
          value={user.name ?? ''}
          onChange={(e) => onChange({ ...user, name: e.target.value })}
        />
      </div>
      <div>
        <label className="label"><span className="label-text">Surname</span></label>
        <input
          className="input input-bordered w-full"
          value={user.surname ?? ''}
          onChange={(e) => onChange({ ...user, surname: e.target.value })}
        />
      </div>
      <div>
        <label className="label"><span className="label-text">Email</span></label>
        <input
          className="input input-bordered w-full"
          value={user.email ?? ''}
          onChange={(e) => onChange({ ...user, email: e.target.value })}
        />
      </div>
      <div>
        <label className="label"><span className="label-text">Role</span></label>
        <select
          className="select select-bordered w-full"
          value={user.role}
          onChange={(e) => onChange({ ...user, role: e.target.value as UserRole })}
        >
          <option value={UserRole.Patient}>Patient</option>
          <option value={UserRole.Doctor}>Doctor</option>
          <option value={UserRole.Admin}>Admin</option>
        </select>
      </div>
      <div>
        <label className="label"><span className="label-text">Approval</span></label>
        <select
          className="select select-bordered w-full"
          value={user.approvalStatus ?? 'pending'}
          onChange={(e) => onChange({ ...user, approvalStatus: e.target.value as 'pending' | 'approved' })}
        >
          <option value="pending">pending</option>
          <option value="approved">approved</option>
        </select>
      </div>
      {user.role === UserRole.Doctor && (
        <>
          <div>
            <label className="label"><span className="label-text">Specialization</span></label>
            <div className="space-y-2">
              {specializations.map((spec, idx) => (
                <div key={idx} className="admin-user-specialization-row">
                  <input
                    className="input input-bordered w-full"
                    value={spec}
                    onChange={(e) => {
                      const next = [...specializations];
                      next[idx] = e.target.value;
                      updateSpecializations(next);
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      const next = specializations.filter((_, i) => i !== idx);
                      updateSpecializations(next);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline w-full"
                onClick={() => updateSpecializations([...specializations, ''])}
              >
                Add specialization
              </button>
            </div>
          </div>
          <div>
            <label className="label"><span className="label-text">Bio</span></label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={user.bio ?? ''}
              onChange={(e) => onChange({ ...user, bio: e.target.value })}
            />
          </div>
        </>
      )}
      {resetLink && (
        <div className="admin-user-reset-row">
          <input
            className="admin-user-reset-link"
            value={resetLink}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            className="admin-user-reset-copy"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(resetLink);
              } catch {
                // ignore clipboard failures (browser policy)
              }
            }}
          >
            Copy link
          </button>
        </div>
      )}
      <div className="admin-user-modal-actions">
        <button
          className="admin-user-btn-primary"
          onClick={() => onSave(user)}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        <button
          className="admin-user-btn-secondary"
          onClick={() => onResetPassword(user)}
          disabled={resetLoading}
        >
          {resetLoading ? 'Generating...' : 'Reset password'}
        </button>
        {resetLink && (
          <a className="admin-user-btn-link" href={resetLink} target="_blank" rel="noreferrer">
            Open reset link
          </a>
        )}
      </div>
    </div>
  );
}
