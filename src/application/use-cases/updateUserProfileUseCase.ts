import type { IUserProfileGateway } from '@/application/ports/IUserProfileGateway';
import type { UserProfile } from '@/domain/entities/UserProfile';

export class UpdateUserProfileUseCase {
  constructor(private profileGateway: IUserProfileGateway) {}

  async execute(userId: string, updates: Partial<UserProfile>): Promise<void> {
    await this.profileGateway.updateProfile(userId, updates);
  }
}
