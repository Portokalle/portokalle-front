import type { IAuthGateway, AuthUser } from '@/application/ports/IAuthGateway';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/infrastructure/firebase/firebaseconfig';
import { testFirebaseConnection } from '@/infrastructure/services/firebaseTest';

export class FirebaseAuthGateway implements IAuthGateway {
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    const authInstance = getAuth();
    return onAuthStateChanged(authInstance, (user) => {
      if (!user) {
        callback(null);
        return;
      }
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
    });
  }

  async login(email: string, password: string): Promise<{ user: AuthUser; role?: string | null }> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.exists() ? (userDoc.data()?.role as string | null) : 'patient';

    const idToken = await user.getIdToken();
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      throw new Error('Failed to establish session');
    }

    return {
      user: { uid: user.uid, email: user.email, displayName: user.displayName },
      role,
    };
  }

  async register(email: string, password: string): Promise<AuthUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return { uid: user.uid, email: user.email, displayName: user.displayName };
  }

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  async testConnection(): Promise<void> {
    await testFirebaseConnection();
  }
}
