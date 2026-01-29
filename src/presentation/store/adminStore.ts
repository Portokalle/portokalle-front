import { create } from 'zustand';
import type { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/entities/UserRole';
import type { PaginationCursor } from '@/shared/types/PaginationCursor';
import type { IAdminGateway } from '@/application/ports/IAdminGateway';

type EditableUser = User & {
  // optional base profile fields (may be absent in base User entity)
  name?: string;
  surname?: string;
  // doctor-extendable fields for editing in panel
  specialization?: string;
  bio?: string;
  specializations?: string[];
  approvalStatus?: 'pending' | 'approved';
};

interface AdminState {
  users: EditableUser[];
  total: number;
  pageSize: number;
  page: number;
  cursors: PaginationCursor[]; // opaque cursors for pagination
  selectedUserId: string | null;
  isPanelOpen: boolean;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  // actions
  loadUsers: (gateway: IAdminGateway) => Promise<void>;
  loadUsersPage: (page: number, gateway: IAdminGateway) => Promise<void>;
  searchUsers: (query: string, gateway: IAdminGateway) => Promise<void>;
  selectUser: (id: string | null) => void;
  loadSelectedDetails: (gateway: IAdminGateway) => Promise<void>;
  updateSelected: (payload: { name?: string; surname?: string; role?: User['role']; email?: string }, gateway: IAdminGateway) => Promise<void>;
  updateDoctorProfile: (payload: { specialization?: string; bio?: string; specializations?: string[] }, gateway: IAdminGateway) => Promise<void>;
  approveDoctor: (id: string, gateway: IAdminGateway) => Promise<void>;
  resetPassword: (id: string, gateway: IAdminGateway) => Promise<void>;
  deleteUser: (id: string, gateway: IAdminGateway) => Promise<void>;
  createAdmin: (payload: { name: string; surname: string; email: string; password: string }, gateway: IAdminGateway) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  total: 0,
  pageSize: 20,
  page: 0,
  cursors: [],
  selectedUserId: null,
  isPanelOpen: false,
  searchQuery: '',
  loading: false,
  error: null,
  async loadUsers(gateway) {
    set({ loading: true, error: null });
    try {
      const users = await gateway.getAllUsers();
      // Coerce base users into EditableUser shape and carry approvalStatus if present
      const editable = users.map(u => ({
        ...u,
        approvalStatus: (u as unknown as { approvalStatus?: 'pending' | 'approved' }).approvalStatus,
      })) as EditableUser[];
      set({ users: editable, total: editable.length });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load users' });
    } finally {
      set({ loading: false });
    }
  },
  async loadUsersPage(page, gateway) {
    const { pageSize, cursors } = get();
    set({ loading: true, error: null });
    try {
      // Determine cursor: for page 0, no cursor; for >0, use last known cursor
      const cursor = page > 0 ? cursors[page - 1] : undefined;
      const res = await gateway.getUsersPage(pageSize, cursor);
      const nextCursors = [...cursors];
      if (res.nextCursor && nextCursors[page] !== res.nextCursor) {
        nextCursors[page] = res.nextCursor;
      }
      const items = (res.items as EditableUser[]).map(u => ({
        ...u,
        approvalStatus: (u as unknown as { approvalStatus?: 'pending' | 'approved' }).approvalStatus,
      }));
      set({ users: items, total: res.total, page, cursors: nextCursors, searchQuery: '' });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load users' });
    } finally {
      set({ loading: false });
    }
  },
  async searchUsers(query, gateway) {
    const q = query.trim().toLowerCase();
    if (!q) {
      // empty query resets to first page
      await get().loadUsersPage(0, gateway);
      return;
    }
    set({ loading: true, error: null, searchQuery: q });
    try {
      // Fetch all users and filter client-side to cover global dataset
      const all = await gateway.getAllUsers();
      const editable = all.map(u => ({
        ...u,
        approvalStatus: (u as unknown as { approvalStatus?: 'pending' | 'approved' }).approvalStatus,
      })) as EditableUser[];
      const filtered = editable.filter(u => {
        const hay = `${u.name ?? ''} ${u.surname ?? ''} ${u.email ?? ''} ${u.role ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
      set({ users: filtered, total: filtered.length, page: 0 });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to search users' });
    } finally {
      set({ loading: false });
    }
  },
  selectUser(id) {
    set({ selectedUserId: id, isPanelOpen: !!id });
  },
  async loadSelectedDetails(gateway) {
    const id = get().selectedUserId; if (!id) return;
    set({ loading: true, error: null });
    try {
      const base = await gateway.getUserById(id);
      const doc = await gateway.getDoctorProfile(id);
      const merged = doc ?? base; // prefer doctor details if available
      if (merged) {
        // replace matching user in list for up-to-date editing
        const mDoctor = merged as unknown as Partial<{ role?: UserRole; specialization?: string; bio?: string; specializations?: string[] }>;
        const doctorFields: Partial<EditableUser> = mDoctor.role === UserRole.Doctor ? {
          specialization: mDoctor.specialization,
          bio: mDoctor.bio,
          specializations: mDoctor.specializations,
        } : {};
        const users = get().users.map(u => (u.id === id ? {
          ...u,
          ...(base ?? {}),
          ...doctorFields,
          approvalStatus: (base as unknown as { approvalStatus?: 'pending' | 'approved' })?.approvalStatus ?? u.approvalStatus,
        } : u));
        set({ users });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load details' });
    } finally {
      set({ loading: false });
    }
  },
  async updateSelected(payload, gateway) {
    const id = get().selectedUserId; if (!id) return;
    set({ loading: true, error: null });
    try {
      await gateway.updateUserFields({ id, ...payload });
      const users = get().users.map(u => (u.id === id ? { ...u, ...payload } : u));
      set({ users });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to update user' });
    } finally {
      set({ loading: false });
    }
  },
  async updateDoctorProfile(payload, gateway) {
    const id = get().selectedUserId; if (!id) return;
    set({ loading: true, error: null });
    try {
      await gateway.updateDoctorFields(id, payload);
      const users = get().users.map(u => (u.id === id ? { ...u, ...payload } : u));
      set({ users });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to update doctor profile' });
    } finally {
      set({ loading: false });
    }
  },
  async approveDoctor(id, gateway) {
    set({ loading: true, error: null });
    try {
      await gateway.updateUserFields({ id, approvalStatus: 'approved' });
      const users = get().users.map(u => (u.id === id ? ({ ...u, approvalStatus: 'approved' } as EditableUser & { approvalStatus: 'approved' }) : u));
      set({ users });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to approve doctor' });
    } finally {
      set({ loading: false });
    }
  },
  async resetPassword(id, gateway) {
    set({ loading: true, error: null });
    try { await gateway.resetUserPassword(id); } catch (e) { set({ error: e instanceof Error ? e.message : 'Failed to reset password' }); }
    finally { set({ loading: false }); }
  },
  async deleteUser(id, gateway) {
    set({ loading: true, error: null });
    try { await gateway.deleteUserAccount(id); } catch (e) { set({ error: e instanceof Error ? e.message : 'Failed to delete user' }); }
    finally { set({ loading: false }); }
  },
  async createAdmin(payload, gateway) {
    set({ loading: true, error: null });
    try { await gateway.createAdminUser(payload); await get().loadUsers(gateway); }
    catch (e) { set({ error: e instanceof Error ? e.message : 'Failed to create admin' }); }
    finally { set({ loading: false }); }
  }
}));
