import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MorphingLogoIntro from '@/components/effects/MorphingLogoIntro';
import FloatingElements from '@/components/effects/FloatingElements';
import ScrollToTop from '@/components/effects/ScrollToTop';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ROICalculatorSection from '@/components/home/ROICalculatorSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PricingSection from '@/components/home/PricingSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import FAQSection from '@/components/home/FAQSection';
import SEO from '@/components/SEO';

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    const introShown = sessionStorage.getItem('wakey-intro-shown');
    if (introShown) {
      setShowIntro(false);
      setContentReady(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setContentReady(true);
    sessionStorage.setItem('wakey-intro-shown', 'true');
  };

  return (
    <div className="grain">
      <SEO />
      <AnimatePresence mode="wait">
        {showIntro && (
          <MorphingLogoIntro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {contentReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <FloatingElements />
          <ScrollToTop />
          <Navbar />
          <main>
            <HeroSection />
            <FeaturesSection />
            <ROICalculatorSection />
            <TestimonialsSection />
            <PricingSection />
            <FAQSection />
            <NewsletterSection />
          </main>
          <Footer />
        </motion.div>
      )}
    </div>
  );
};

export default Index;
