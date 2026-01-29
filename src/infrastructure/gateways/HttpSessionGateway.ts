import type { ISessionGateway } from '@/application/ports/ISessionGateway';
import { logoutApi } from '@/infrastructure/http/logoutApi';

export class HttpSessionGateway implements ISessionGateway {
  async logoutServerSession(): Promise<void> {
    await logoutApi();
  }
}
