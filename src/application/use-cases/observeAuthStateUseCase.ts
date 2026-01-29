import type { IAuthGateway, AuthUser } from '@/application/ports/IAuthGateway';
import type { IUserProfileGateway } from '@/application/ports/IUserProfileGateway';
import type { UserProfile } from '@/domain/entities/UserProfile';

export type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  profile: UserProfile | null;
};

export class ObserveAuthStateUseCase {
  constructor(
    private authGateway: IAuthGateway,
    private profileGateway: IUserProfileGateway
  ) {}

  subscribe(onChange: (state: AuthState) => void): () => void {
    return this.authGateway.onAuthStateChanged(async (user) => {
      if (!user) {
        onChange({ isAuthenticated: false, user: null, profile: null });
        return;
      }
      try {
        const profile = await this.profileGateway.getProfile(user.uid);
        onChange({ isAuthenticated: true, user, profile });
      } catch {
        onChange({ isAuthenticated: true, user, profile: null });
      }
    });
  }
}
