import {
  AssetTypes,
  CaseStudiesSection,
  CaseStudyCards,
  ClientTypes,
  CryptoSection,
  CTASection,
  HeroSection,
  HowItWorks,
  RecoveryIdentity,
  ServiceRows,
  StockSection,
  Testimonials,
  TrustSection,
} from '../sections/home/index.js';

export { CaseStudyCards, CTASection, HowItWorks, TrustSection };

export function HomePage(){
  return (
    <main>
      <HeroSection/>
      <RecoveryIdentity/>
      <ServiceRows/>
      <HowItWorks/>
      <CryptoSection/>
      <StockSection/>
      <AssetTypes/>
      <TrustSection/>
      <CaseStudiesSection/>
      <ClientTypes/>
      <Testimonials/>
      <CTASection/>
    </main>
  );
}
