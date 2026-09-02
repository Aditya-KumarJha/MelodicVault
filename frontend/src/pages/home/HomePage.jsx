import {
  HeroSection,
  FooterCtaSection,
  HowItWorksSection,
  IncidentResolutionSection,
  MonitorGrid,
  TestimonialsSection,
} from './sections';
import { SEO } from '../../components/seo';

const HomePage = () => {
  return (
    <>
      <SEO
        title="Melodic Vault"
        description="Secure files with melody and rhythm based authentication, local encryption, and metadata-only backend storage."
      />
      <main className="relative w-screen max-w-full overflow-hidden bg-[#0A0C10]">
        <div><HeroSection /></div>
        <div className="relative z-0 w-screen max-w-full sm:h-[200svh]">
          <div className="relative overflow-visible sm:sticky sm:top-0 sm:h-screen sm:overflow-hidden">
            <MonitorGrid />
          </div>
        </div>
        <div className="relative z-120 w-screen max-w-full sm:mt-[-100svh]">
          <HowItWorksSection />
        </div>
        <IncidentResolutionSection className="relative z-70 w-screen max-w-full" />
        <TestimonialsSection />
        <FooterCtaSection />
      </main>
    </>
  );
};

export default HomePage;
