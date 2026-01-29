"use client";
import React, { createContext, useContext } from 'react';
import { FetchAppointmentsUseCase } from '@/application/use-cases/fetchAppointmentsUseCase';
import { CreateAppointmentUseCase } from '@/application/use-cases/createAppointmentUseCase';
import { CheckProfileCompleteUseCase } from '@/application/use-cases/checkProfileCompleteUseCase';
import { LogoutSessionUseCase } from '@/application/use-cases/logoutSessionUseCase';
import { ObserveAuthStateUseCase } from '@/application/use-cases/observeAuthStateUseCase';
import { LoginUseCase } from '@/application/use-cases/loginUseCase';
import { RegisterUserUseCase } from '@/application/use-cases/registerUserUseCase';
import { SendPasswordResetUseCase } from '@/application/use-cases/sendPasswordResetUseCase';
import { FetchUserProfileUseCase } from '@/application/use-cases/fetchUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@/application/use-cases/updateUserProfileUseCase';
import type { IAdminGateway } from '@/application/ports/IAdminGateway';
import type { IAppointmentService } from '@/application/ports/IAppointmentService';
import type { IDoctorSearchService } from '@/application/ports/IDoctorSearchService';
import type { INotificationService } from '@/application/ports/INotificationService';
import type { IVideoService } from '@/application/ports/IVideoService';
import type { IAppointmentRepository } from '@/domain/repositories/IAppointmentRepository';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';
import type { IAuthGateway } from '@/application/ports/IAuthGateway';
import type { ISessionGateway } from '@/application/ports/ISessionGateway';
import { FirebaseAppointmentRepository } from '@/infrastructure/repositories/FirebaseAppointmentRepository';
import { FirebaseUserRepository } from '@/infrastructure/repositories/FirebaseUserRepository';
import { FirebaseSessionRepository } from '@/infrastructure/repositories/FirebaseSessionRepository';
import { FirebaseAuthGateway } from '@/infrastructure/gateways/FirebaseAuthGateway';
import { FirebaseUserProfileGateway } from '@/infrastructure/gateways/FirebaseUserProfileGateway';
import { FirebaseRegistrationGateway } from '@/infrastructure/gateways/FirebaseRegistrationGateway';
import { FirebaseAdminGateway } from '@/infrastructure/gateways/FirebaseAdminGateway';
import { AppointmentServiceGateway } from '@/infrastructure/gateways/AppointmentServiceGateway';
import { DoctorSearchServiceGateway } from '@/infrastructure/gateways/DoctorSearchServiceGateway';
import { NotificationServiceGateway } from '@/infrastructure/gateways/NotificationServiceGateway';
import { VideoServiceGateway } from '@/infrastructure/gateways/VideoServiceGateway';
import { HttpSessionGateway } from '@/infrastructure/gateways/HttpSessionGateway';

interface DIContextValue {
  appointmentRepository: IAppointmentRepository;
  userRepository: IUserRepository;
  authGateway: IAuthGateway;
  sessionGateway: ISessionGateway;
  fetchAppointmentsUseCase: FetchAppointmentsUseCase;
  createAppointmentUseCase: CreateAppointmentUseCase;
  checkProfileCompleteUseCase: CheckProfileCompleteUseCase;
  logoutSessionUseCase: LogoutSessionUseCase;
  observeAuthStateUseCase: ObserveAuthStateUseCase;
  loginUseCase: LoginUseCase;
  registerUserUseCase: RegisterUserUseCase;
  sendPasswordResetUseCase: SendPasswordResetUseCase;
  fetchUserProfileUseCase: FetchUserProfileUseCase;
  updateUserProfileUseCase: UpdateUserProfileUseCase;
  adminGateway: IAdminGateway;
  appointmentService: IAppointmentService;
  doctorSearchService: IDoctorSearchService;
  notificationService: INotificationService;
  videoService: IVideoService;
}

const DIContext = createContext<DIContextValue | undefined>(undefined);

export const DIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appointmentRepo = new FirebaseAppointmentRepository();
  const userRepo = new FirebaseUserRepository();
  const fetchAppointmentsUseCase = new FetchAppointmentsUseCase(appointmentRepo);
  const createAppointmentUseCase = new CreateAppointmentUseCase(appointmentRepo);
  const checkProfileCompleteUseCase = new CheckProfileCompleteUseCase(userRepo);
  const logoutSessionUseCase = new LogoutSessionUseCase(new FirebaseSessionRepository());

  const authGateway = new FirebaseAuthGateway();
  const sessionGateway = new HttpSessionGateway();
  const profileGateway = new FirebaseUserProfileGateway();
  const observeAuthStateUseCase = new ObserveAuthStateUseCase(authGateway, profileGateway);
  const loginUseCase = new LoginUseCase(authGateway);
  const sendPasswordResetUseCase = new SendPasswordResetUseCase(authGateway);
  const registerUserUseCase = new RegisterUserUseCase(new FirebaseRegistrationGateway());
  const fetchUserProfileUseCase = new FetchUserProfileUseCase(profileGateway);
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(profileGateway);

  const adminGateway = new FirebaseAdminGateway();
  const appointmentService = new AppointmentServiceGateway();
  const doctorSearchService = new DoctorSearchServiceGateway();
  const notificationService = new NotificationServiceGateway();
  const videoService = new VideoServiceGateway();

  return (
    <DIContext.Provider value={{
      appointmentRepository: appointmentRepo,
      userRepository: userRepo,
      authGateway,
      sessionGateway,
      fetchAppointmentsUseCase,
      createAppointmentUseCase,
      checkProfileCompleteUseCase,
      logoutSessionUseCase,
      observeAuthStateUseCase,
      loginUseCase,
      registerUserUseCase,
      sendPasswordResetUseCase,
      fetchUserProfileUseCase,
      updateUserProfileUseCase,
      adminGateway,
      appointmentService,
      doctorSearchService,
      notificationService,
      videoService,
    }}>
      {children}
    </DIContext.Provider>
  );
};

export function useDI() {
  const context = useContext(DIContext);
  if (!context) throw new Error('useDI must be used within a DIProvider');
  return context;
}
