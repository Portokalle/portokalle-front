import type { IRegistrationGateway, RegistrationPayload } from '@/application/ports/IRegistrationGateway';

export class RegisterUserUseCase {
  constructor(private registrationGateway: IRegistrationGateway) {}

  async execute(payload: RegistrationPayload): Promise<{ uid: string }> {
    return this.registrationGateway.register(payload);
  }
}
