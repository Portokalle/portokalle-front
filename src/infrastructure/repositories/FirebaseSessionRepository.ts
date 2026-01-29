import { getAuth, signOut } from 'firebase/auth';
import type { ISessionRepository } from '@/domain/repositories/ISessionRepository';

export class FirebaseSessionRepository implements ISessionRepository {
  logout(): void {
    const auth = getAuth();
    signOut(auth);
  }
}
