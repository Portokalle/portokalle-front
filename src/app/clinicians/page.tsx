'use client';

import HeroSection from '@/presentation/components/heroSection';
import NavBar from '@/presentation/components/navBar';
import FooterSection from '@/presentation/components/footerSection';
import ClinicBenefitsSection from './ClinicBenefitsSection';
import ClinicHowItWorksSection from './ClinicHowItWorksSection';
import ClinicCtaSection from './ClinicCtaSection';

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
