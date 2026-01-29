import type { UserRole } from '@/domain/entities/UserRole';

export type RegistrationPayload = {
  name: string;
  surname: string;
  phone: string;
  email: string;
  password: string;
  role: UserRole;
};

export interface IRegistrationGateway {
  register(payload: RegistrationPayload): Promise<{ uid: string }>;
}
