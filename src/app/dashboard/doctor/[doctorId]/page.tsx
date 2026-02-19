import DoctorProfile from '@/presentation/components/doctor/DoctorProfile';

export default async function DoctorPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const { doctorId } = await params;
  return <DoctorProfile id={doctorId} />;
}
