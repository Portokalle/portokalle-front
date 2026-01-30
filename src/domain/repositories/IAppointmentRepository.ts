import { Appointment } from '../entities/Appointment';
import { AppointmentStatus } from '../entities/AppointmentStatus';

export interface IAppointmentRepository {
  getById(id: string): Promise<Appointment | null>;
  getByUser(userId: string, isDoctor: boolean): Promise<Appointment[]>;
  getAll(): Promise<Appointment[]>;
  getByStatus(status: AppointmentStatus): Promise<Appointment[]>;
  create(payload: Partial<Appointment>): Promise<Appointment>;
  update(id: string, updates: Partial<Appointment>): Promise<Appointment>;
  markAsPaid(id: string): Promise<Appointment>;
  delete(id: string): Promise<void>;
  subscribePendingByDoctor(
    doctorId: string,
    onChange: (appointments: Appointment[]) => void
  ): () => void;
}
