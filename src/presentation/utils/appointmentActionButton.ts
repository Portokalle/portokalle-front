import { Appointment } from "@/domain/entities/Appointment";
import { UserRole } from "@/domain/entities/UserRole";

export enum AppointmentActionVariant {
  Finished = "finished",
  Join = "join",
  Pay = "pay",
  None = "none",
}
//TODO: move from here
const LABEL: Record<AppointmentActionVariant, string> = {
  [AppointmentActionVariant.Finished]: "Finished",
  [AppointmentActionVariant.Join]: "Join Now",
  [AppointmentActionVariant.Pay]: "Pay Now",
  [AppointmentActionVariant.None]: "",
};

type AppointmentAction = {
  label: string;
  disabled: boolean;
  variant: AppointmentActionVariant;
};

const action = (variant: AppointmentActionVariant, disabled = false): AppointmentAction => ({
  label: LABEL[variant],
  disabled,
  variant,
});

export function getAppointmentAction(
  appointment: Appointment,
  isAppointmentPast: (appointment: Appointment) => boolean,
  role?: UserRole | null
): AppointmentAction {
  if (isAppointmentPast(appointment)) return action(AppointmentActionVariant.Finished, true);

  switch (appointment.status) {
    case "pending":
      return { label: "Pending", disabled: true, variant: AppointmentActionVariant.Pay };

    case "rejected":
      return { label: "Declined", disabled: true, variant: AppointmentActionVariant.None };

    case "accepted":
      if (role === UserRole.Doctor) return action(AppointmentActionVariant.Join);
      if (role === UserRole.Patient) {
        return appointment.isPaid
          ? action(AppointmentActionVariant.Join)
          : action(AppointmentActionVariant.Pay);
      }
      break;
  }

  return action(AppointmentActionVariant.None, true);
}
