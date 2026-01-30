import type { UserRole } from '@/domain/entities/UserRole';

export type AuthUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
};

export interface IAuthGateway {
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  login(email: string, password: string): Promise<{ user: AuthUser; role?: UserRole | null }>;
  register(email: string, password: string): Promise<AuthUser>;
  sendPasswordReset(email: string): Promise<void>;
  testConnection(): Promise<void>;
}
