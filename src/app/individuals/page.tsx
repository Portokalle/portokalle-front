'use client';

import HeroSection from '@/presentation/components/heroSection';
import NavBar from '@/presentation/components/navBar';


import IndividualBenefitsSection from '@/presentation/components/individuals/IndividualBenefitsSection';
import IndividualHowItWorksSection from '@/presentation/components/individuals/IndividualHowItWorksSection';
import IndividualCtaSection from '@/presentation/components/individuals/IndividualCtaSection';
import FooterSection from '@/presentation/components/footerSection';

export default function IndividualsPage() {
  return (
    <>
      <NavBar />
      <HeroSection 
        backgroundImage="https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-shvetsa-4225920.jpg"
      />
  <IndividualBenefitsSection />
  <IndividualHowItWorksSection />
  <IndividualCtaSection />
      <FooterSection />
    </>
  );
}
