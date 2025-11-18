'use client';

import DoctorProfile from '../../../components/DoctorProfile';
import React from 'react';

export default function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <DoctorProfile id={id} />;
}
