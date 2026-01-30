export enum UserRole {
	Doctor = 'doctor',
	Patient = 'patient',
	Admin = 'admin',
}

export function isUserRole(value: unknown): value is UserRole {
	return Object.values(UserRole).includes(value as UserRole);
}

export function toUserRole(value: unknown): UserRole | null {
	return isUserRole(value) ? (value as UserRole) : null;
}
