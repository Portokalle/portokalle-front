import type { UserProfile } from '@/domain/entities/UserProfile';

export interface IUserProfileGateway {
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void>;
}
