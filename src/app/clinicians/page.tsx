'use client';

import HeroSection from '@/presentation/components/heroSection';
import NavBar from '@/presentation/components/navBar';
import FooterSection from '@/presentation/components/footerSection';
import ClinicBenefitsSection from '@/presentation/components/clinicians/ClinicBenefitsSection';
import ClinicHowItWorksSection from '@/presentation/components/clinicians/ClinicHowItWorksSection';
import ClinicCtaSection from '@/presentation/components/clinicians/ClinicCtaSection';

export default function ClinicsPage() {
  return (
    <>
      <NavBar />
      <HeroSection 
        backgroundImage="https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-karolina-grabowska-7195310.jpg"
      />
      <ClinicBenefitsSection />
      <ClinicHowItWorksSection />
      <ClinicCtaSection />
      <FooterSection />
    </>
  );
}
