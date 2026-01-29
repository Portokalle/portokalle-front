import type { IUserProfileGateway } from '@/application/ports/IUserProfileGateway';
import type { UserProfile } from '@/domain/entities/UserProfile';

export class FetchUserProfileUseCase {
  constructor(private profileGateway: IUserProfileGateway) {}

  async execute(userId: string): Promise<UserProfile | null> {
    return this.profileGateway.getProfile(userId);
  }
}
