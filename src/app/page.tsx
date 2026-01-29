import HeroSection from "@/presentation/components/heroSection";
import NavBar from "@/presentation/components/navBar";
import ContentSection from "@/presentation/components/contentSection";
import ModernCtaSection from "@/presentation/components/ModernCtaSection";
import Contact from "@/presentation/components/contact";
import "./styles.css"; // Ensure you import the CSS file for styling
import FooterSection from "@/presentation/components/footerSection";

export default function Home() {
  return (
    <div>
      <div className="navbar-wrapper">
        <NavBar />
      </div>
      <HeroSection />
      <ContentSection />
      <ModernCtaSection />
      <Contact />
      <FooterSection />
    </div>
  );
}