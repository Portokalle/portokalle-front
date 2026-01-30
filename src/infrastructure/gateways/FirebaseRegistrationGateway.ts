import type { IRegistrationGateway, RegistrationPayload } from '@/application/ports/IRegistrationGateway';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/infrastructure/firebase/firebaseconfig';
import { UserRole } from '@/domain/entities/UserRole';

export class FirebaseRegistrationGateway implements IRegistrationGateway {
  async register(payload: RegistrationPayload): Promise<{ uid: string }> {
    const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
    const user = userCredential.user;

    const isDoctor = payload.role === UserRole.Doctor;
    await setDoc(doc(db, 'users', user.uid), {
      name: payload.name,
      surname: payload.surname,
      phoneNumber: payload.phone,
      email: payload.email,
      role: payload.role,
      ...(isDoctor ? { approvalStatus: 'pending' } : {}),
      createdAt: new Date().toISOString(),
    });

    if (isDoctor) {
      await addDoc(collection(db, 'notifications'), {
        type: 'doctor_registration',
        userId: user.uid,
        name: payload.name,
        surname: payload.surname,
        email: payload.email,
        createdAt: serverTimestamp(),
        status: 'pending',
      });
    }

    return { uid: user.uid };
  }
}
