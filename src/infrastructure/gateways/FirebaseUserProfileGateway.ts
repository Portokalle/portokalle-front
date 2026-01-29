import type { IUserProfileGateway } from '@/application/ports/IUserProfileGateway';
import type { UserProfile } from '@/domain/entities/UserProfile';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase/firebaseconfig';

export class FirebaseUserProfileGateway implements IUserProfileGateway {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as Record<string, unknown>;
    return {
      id: userId,
      name: data.name as string | undefined,
      surname: data.surname as string | undefined,
      email: data.email as string | undefined,
      phoneNumber: data.phoneNumber as string | undefined,
      about: data.about as string | undefined,
      specializations: (data.specializations as string[] | undefined) ?? undefined,
      education: (data.education as string[] | undefined) ?? undefined,
      profilePicture: data.profilePicture as string | undefined,
      role: data.role as UserProfile['role'],
      approvalStatus: data.approvalStatus as UserProfile['approvalStatus'],
      specialization: data.specialization as string | undefined,
      bio: data.bio as string | undefined,
    };
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const ref = doc(db, 'users', userId);
    await setDoc(ref, updates, { merge: true });
  }
}
