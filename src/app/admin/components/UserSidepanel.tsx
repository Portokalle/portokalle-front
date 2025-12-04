"use client";

import { useAdminStore } from "@/store/adminStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "./ToastProvider";
import { UserRole } from "@/domain/entities/UserRole";

export function UserSidepanel() {
  const {
    users,
    selectedUserId,
    isPanelOpen,
    selectUser,
    deleteUser,
    loading,
    error,
    updateSelected,
    updateDoctorProfile,
    loadSelectedDetails,
  } = useAdminStore();

  const user = useMemo(() => users.find(u => u.id === selectedUserId) ?? null, [users, selectedUserId]);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const { showToast } = useToast();
  const [local, setLocal] = useState<{ name?: string; surname?: string; email?: string; role?: UserRole; specialization?: string; bio?: string; specializations?: string[] }>({});
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => { if (selectedUserId) loadSelectedDetails(); }, [selectedUserId, loadSelectedDetails]);
  useEffect(() => {
    if (user) {
      setLocal({
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: (user.role as UserRole) ?? undefined,
        specialization: user.specialization,
        bio: user.bio,
        specializations: user.specializations,
      });
    }
  }, [user]);

  // Allow page scroll; close panel on outside click
  useEffect(() => {
    if (!isPanelOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        selectUser(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPanelOpen, selectUser]);

  const panelClass = `absolute right-0 top-0 h-full w-1/2 max-w-[640px] bg-white shadow-xl p-4 font-app rounded-l-2xl transition-transform duration-300 ease-out z-50 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`;

  const save = async () => {
    try {
  await updateSelected({ name: local.name, surname: local.surname, role: local.role, email: local.email });
      if (local.role === UserRole.Doctor) {
        await updateDoctorProfile({ specialization: local.specialization, bio: local.bio, specializations: local.specializations });
      }
      showToast('Profile updated', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update profile', 'error');
    }
  };

  const generateReset = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }), credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset');
      setResetLink(data.resetLink || null);
      showToast('Password reset link generated', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to generate reset link', 'error');
    }
  };

  const copyReset = async () => {
    if (!resetLink) return;
    try { await navigator.clipboard.writeText(resetLink); showToast('Copied to clipboard', 'success'); }
    catch { showToast('Failed to copy', 'error'); }
  };

  if (!isPanelOpen) return null;
  return (
    <>
      <aside ref={panelRef} className={panelClass} aria-hidden={false} tabIndex={0}>
        <button className="absolute top-3 right-3 rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100" onClick={() => selectUser(null)} aria-label="Close sidebar">✕</button>
        <h3 className="text-lg font-semibold mb-3">User Details</h3>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {!user ? (
          <div className="text-gray-600">No user selected.</div>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-600">Name</span>
              <input className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2" value={local.name ?? ''} onChange={e => setLocal({ ...local, name: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Surname</span>
              <input className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2" value={local.surname ?? ''} onChange={e => setLocal({ ...local, surname: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Email</span>
              <input type="email" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2" value={local.email ?? ''} onChange={e => setLocal({ ...local, email: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Role</span>
              <select className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2" value={local.role ?? UserRole.Patient} onChange={e => setLocal({ ...local, role: e.target.value as unknown as UserRole })}>
                <option value={UserRole.Patient}>User</option>
                <option value={UserRole.Doctor}>Doctor</option>
                <option value={UserRole.Admin}>Admin</option>
              </select>
            </label>
            {local.role === UserRole.Doctor && (
              <>
                <label className="block">
                  <span className="text-sm text-gray-600">Specialization</span>
                  <input className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2" value={local.specialization ?? ''} onChange={e => setLocal({ ...local, specialization: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-600">Bio</span>
                  <textarea className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2" rows={4} value={local.bio ?? ''} onChange={e => setLocal({ ...local, bio: e.target.value })} />
                </label>
              </>
            )}
            <div className="mt-3 flex gap-2 justify-end">
              <button className="px-5 py-2 rounded-full border border-gray-300 hover:bg-gray-100" disabled={loading} onClick={() => selectUser(null)}>Cancel</button>
              <button className="px-6 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-70" disabled={loading} onClick={save}>Save</button>
            </div>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-70" disabled={loading} onClick={generateReset}>Generate Reset Link</button>
          <button className="px-4 py-2 rounded-full border border-orange-500 text-orange-700 hover:bg-orange-50" disabled={loading} onClick={() => { if (user && confirm('Delete this user?')) deleteUser(user.id); }}>Delete User</button>
        </div>
        {resetLink && (
          <div className="mt-3 bg-gray-50 border rounded p-2">
            <div className="font-medium mb-1">Reset Link</div>
            <div className="break-all text-sm">{resetLink}</div>
            <button className="mt-2 px-4 py-1 rounded-full border border-gray-300 hover:bg-gray-100" onClick={copyReset}>Copy Link</button>
          </div>
        )}
      </aside>
    </>
  );
}