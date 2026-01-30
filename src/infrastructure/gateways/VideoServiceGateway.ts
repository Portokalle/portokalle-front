import type { IVideoService } from '@/application/ports/IVideoService';
import { generateRoomCodeAndToken } from '@/infrastructure/services/100msService';
import type { UserRole } from '@/domain/entities/UserRole';

export class VideoServiceGateway implements IVideoService {
  generateRoomCodeAndToken(params: { appointmentId: string; userId: string; role: UserRole }): Promise<{ roomCode?: string; token?: string; room_id?: string }> {
    return generateRoomCodeAndToken({
      user_id: params.userId,
      room_id: params.appointmentId,
      role: params.role,
    });
  }
}
