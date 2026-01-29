import { ISessionRepository } from '@/domain/repositories/ISessionRepository';

export class LogoutSessionUseCase {
  constructor(private sessionRepo: ISessionRepository) {}

  execute(): void {
    this.sessionRepo.logout();
  }
}
