import { IAppointmentRepository } from '@/domain/repositories/IAppointmentRepository';
import { Appointment } from '@/domain/entities/Appointment';
import { AppointmentStatus } from '@/domain/entities/AppointmentStatus';

export class FirebaseAppointmentRepository implements IAppointmentRepository {
  async getById(id: string): Promise<Appointment | null> {
  const { getFirestore, doc, getDoc } = await import('firebase/firestore');
  const db = getFirestore();
  const appointmentRef = doc(db, 'appointments', id);
  const snapshot = await getDoc(appointmentRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Appointment;
  }
  async getByUser(userId: string, isDoctor: boolean): Promise<Appointment[]> {
    // Import Firestore client
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
    const db = getFirestore();
    const field = isDoctor ? 'doctorId' : 'patientId';
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where(field, '==', userId));
    const snapshot = await getDocs(q);
    const results: Appointment[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      results.push({ id: doc.id, ...data } as Appointment);
    });
    return results;
  }
  async getAll(): Promise<Appointment[]> {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore();
    const appointmentsRef = collection(db, 'appointments');
    const snapshot = await getDocs(appointmentsRef);
    const results: Appointment[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      results.push({ id: doc.id, ...data } as Appointment);
    });
    return results;
  }
  async getByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
    const db = getFirestore();
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('status', '==', status));
    const snapshot = await getDocs(q);
    const results: Appointment[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      results.push({ id: doc.id, ...data } as Appointment);
    });
    return results;
  }
  async create(payload: Partial<Appointment>): Promise<Appointment> {
  const { getFirestore, collection, addDoc, getDoc, doc } = await import('firebase/firestore');
  const db = getFirestore();
  const appointmentsRef = collection(db, 'appointments');
  const docRef = await addDoc(appointmentsRef, payload);
  const snapshot = await getDoc(doc(db, 'appointments', docRef.id));
  return { id: docRef.id, ...snapshot.data() } as Appointment;
  }
  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
  const { getFirestore, doc, updateDoc, getDoc } = await import('firebase/firestore');
  const db = getFirestore();
  const appointmentRef = doc(db, 'appointments', id);
  await updateDoc(appointmentRef, updates);
  const snapshot = await getDoc(appointmentRef);
  return { id: snapshot.id, ...snapshot.data() } as Appointment;
  }
  async markAsPaid(id: string): Promise<Appointment> {
  // Mark appointment as paid
  return await this.update(id, { isPaid: true });
  }
  async delete(id: string): Promise<void> {
  const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
  const db = getFirestore();
  const appointmentRef = doc(db, 'appointments', id);
  await deleteDoc(appointmentRef);
  }

  subscribePendingByDoctor(
    doctorId: string,
    onChange: (appointments: Appointment[]) => void
  ): () => void {
    let unsubscribe = () => {};
    let cancelled = false;
    import('firebase/firestore')
      .then(({ getFirestore, collection, query, where, onSnapshot }) => {
        if (cancelled) return;
        const db = getFirestore();
        const q = query(
          collection(db, 'appointments'),
          where('doctorId', '==', doctorId),
          where('status', '==', 'pending')
        );
        unsubscribe = onSnapshot(q, (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Appointment[];
          onChange(items);
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }
}
