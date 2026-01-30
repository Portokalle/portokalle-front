import type { User } from '@/domain/entities/User';

export interface Doctor extends User {
  specialization: string;
  bio: string;
}
