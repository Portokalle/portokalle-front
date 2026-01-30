import type { UserRole } from '@/domain/entities/UserRole';

export interface IVideoService {
  generateRoomCodeAndToken(params: { appointmentId: string; userId: string; role: UserRole }): Promise<{ roomCode?: string; token?: string; room_id?: string }>;
}
