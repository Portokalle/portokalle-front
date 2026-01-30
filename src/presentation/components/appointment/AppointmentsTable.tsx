import React from 'react';
import { useTranslation } from 'react-i18next';
import CenteredLoader from '../CenteredLoader';
import { Appointment } from '@/domain/entities/Appointment';
import { UserRole, toUserRole } from '@/domain/entities/UserRole';
import { getAppointmentAction } from '@/presentation/utils/appointmentActionButton';
import { DEFAULT_APPOINTMENT_PAYMENT_AMOUNT } from '@/domain/constants/paymentConfig';

interface AppointmentsTableProps {
	appointments: Appointment[];
	role: UserRole | null;
	isAppointmentPast: (appointment: Appointment) => boolean;
	handleJoinCall: (appointmentId: string) => void;
	handlePayNow: (appointmentId: string, amount: number) => void;
	showActions?: boolean;
	maxRows?: number;
	loading?: boolean;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
	appointments,
	role,
	isAppointmentPast,
	handleJoinCall,
	handlePayNow,
	showActions = true,
	maxRows = 3,
	loading = false,
}) => {
	const { t } = useTranslation();

	if (loading) {
		return <CenteredLoader />;
	}
	return (
		<>
			{/* Desktop Table */}
			<div className="overflow-x-auto mt-6 hidden md:block">
				<table className="table table-zebra w-full text-sm md:text-base">
					<thead>
						<tr>
							<th>{t('date')}</th>
							<th>{role === UserRole.Doctor ? t('patient') : t('doctor')}</th>
							<th>{t('type')}</th>
							<th>{t('time')}</th>
							<th>{t('notes')}</th>
							<th>{t('status')}</th>
							{showActions && <th>{t('actions')}</th>}
						</tr>
					</thead>
					<tbody>
						{appointments && appointments.length > 0 ? (
							[...appointments]
								.sort((a, b) => {
									const dateA = new Date(a.preferredDate).getTime();
									const dateB = new Date(b.preferredDate).getTime();
									if (dateA !== dateB) return dateB - dateA;
									const createdAtA = new Date(a.createdAt).getTime();
									const createdAtB = new Date(b.createdAt).getTime();
									return createdAtB - createdAtA;
								})
								.slice(0, maxRows)
								.map((appointment) => {
									const userRoleEnum = toUserRole(role);
									const action = getAppointmentAction(appointment, isAppointmentPast, userRoleEnum);
									return (
										<tr key={appointment.id}>
											<td>{appointment.preferredDate}</td>
											<td>
												{role === UserRole.Doctor
													? appointment.patientName || 'N/A'
													: (
														<a
															href={`/dashboard/doctor/${appointment.doctorId}`}
															className="text-orange-500 underline hover:text-orange-700"
														>
															{appointment.doctorName}
														</a>
													)}
											</td>
											<td>{appointment.appointmentType}</td>
											<td>{appointment.preferredTime}</td>
											<td>{appointment.notes}</td>
											<td>
												{appointment.status === "accepted" ? (
													<span className="text-green-500 font-bold">{t('accepted')}</span>
												) : appointment.status === "rejected" ? (
													<span className="text-red-500 font-bold">{t('declined')}</span>
												) : appointment.status === "pending" ? (
													<span className="text-gray-500 font-bold">{t('pending')}</span>
												) : (
													<span className="text-yellow-500 font-bold">{appointment.status}</span>
												)}
											</td>
											{showActions && (
												<td>
													{role !== UserRole.Doctor && action.label === 'Pay Now' && !action.disabled && (
														<button
															className="bg-transparent hover:bg-orange-500 text-orange-700 font-semibold hover:text-white py-2 px-4 border border-orange-500 hover:border-transparent rounded-full"
															onClick={() => handlePayNow(appointment.id, DEFAULT_APPOINTMENT_PAYMENT_AMOUNT)}
														>
															{t('payNow')}
														</button>
													)}
													{action.label === 'Join Now' && !action.disabled && (
														<button
															className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full"
															onClick={() => handleJoinCall(appointment.id)}
														>
															{t('joinNow')}
														</button>
													)}
													{action.disabled && role === UserRole.Doctor && (
														<span className="text-orange-500 font-semibold">
															{t('waitingForPayment')}
														</span>
													)}
													{action.disabled && role !== UserRole.Doctor && (
														<button
															className="bg-gray-400 text-white font-bold py-2 px-4 rounded-full opacity-50 cursor-not-allowed"
															disabled
														>
															{action.label}
														</button>
													)}
												</td>
											)}
										</tr>
									);
								})
						) : (
							<tr>
								<td colSpan={showActions ? 7 : 6} className="text-center">{t('noAppointmentsFound')}</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			{/* ...existing code for mobile/tablet view... */}
		</>
	);
};

export default AppointmentsTable;
