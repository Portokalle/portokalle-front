export interface ISessionGateway {
  logoutServerSession(): Promise<void>;
}
