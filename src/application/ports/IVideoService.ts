export interface IVideoService {
  generateRoomCodeAndToken(params: { appointmentId: string; userId: string; role: string }): Promise<{ roomCode?: string; token?: string; room_id?: string }>;
}
