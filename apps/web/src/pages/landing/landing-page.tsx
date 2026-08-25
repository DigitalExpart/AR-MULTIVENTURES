import { HeroSection } from './hero-section';
import { TrustSection } from './trust-section';
import { ServicesSection } from './services-section';
import { HowItWorksSection } from './how-it-works-section';
import { MaterialsSection } from './materials-section';
import { HaulageSection } from './haulage-section';
import { PlatformPreviewSection } from './platform-preview-section';
import { CtaSection } from './cta-section';

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <ServicesSection />
      <HowItWorksSection />
      <MaterialsSection />
      <HaulageSection />
      <PlatformPreviewSection />
      <CtaSection />
    </>
  );
}
