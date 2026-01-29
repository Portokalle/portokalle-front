'use client';

import HeroSection from '@/presentation/components/heroSection';
import NavBar from '@/presentation/components/navBar';
import FooterSection from '@/presentation/components/footerSection';
import DoctorStatsSection from '@/presentation/components/doctor/DoctorStatsSection';
import DoctorFeaturesSection from '@/presentation/components/doctor/DoctorFeaturesSection';
import DoctorHowItWorksSection from '@/presentation/components/doctor/DoctorHowItWorksSection';

export default function DoctorsPage() {
  return (
    <>
      <NavBar />
      <HeroSection 
        backgroundImage="https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-karolina-grabowska-4021779.jpg"
      />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <DoctorStatsSection />
        <DoctorFeaturesSection />
        <DoctorHowItWorksSection />
      </main>
      <FooterSection />
    </>
  );
}
