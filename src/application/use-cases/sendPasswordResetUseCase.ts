import type { IAuthGateway } from '@/application/ports/IAuthGateway';

export class SendPasswordResetUseCase {
  constructor(private authGateway: IAuthGateway) {}

  async execute(email: string): Promise<void> {
    await this.authGateway.sendPasswordReset(email);
  }
}
