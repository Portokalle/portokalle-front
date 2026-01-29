import type { IAuthGateway, AuthUser } from '@/application/ports/IAuthGateway';

export class LoginUseCase {
  constructor(private authGateway: IAuthGateway) {}

  async execute(email: string, password: string): Promise<{ user: AuthUser; role?: string | null }> {
    return this.authGateway.login(email, password);
  }
}
