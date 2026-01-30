import type { IAuthGateway, AuthUser } from '@/application/ports/IAuthGateway';
import type { UserRole } from '@/domain/entities/UserRole';

export class LoginUseCase {
  constructor(private authGateway: IAuthGateway) {}

  async execute(email: string, password: string): Promise<{ user: AuthUser; role?: UserRole | null }> {
    return this.authGateway.login(email, password);
  }
}
