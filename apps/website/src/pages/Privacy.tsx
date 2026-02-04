import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollSection from '@/components/effects/ScrollSection';

const Privacy = () => {
  return (
    <div className="grain">
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <ScrollSection fadeIn fadeOut parallax className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl font-serif mb-6">
                <span className="gradient-text">Privacy Policy</span>
              </h1>
              <p className="text-muted-foreground">Last updated: January 2026</p>
            </motion.div>
          </ScrollSection>

          <ScrollSection fadeIn fadeOut parallax>
            <div className="prose prose-invert max-w-none space-y-8">
              <section className="premium-card">
                <h2 className="text-xl font-serif mb-4">Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We collect information you provide directly, such as when you create an account, 
                  use our services, or contact us. This includes your name, email address, and 
                  usage data to help improve your productivity experience.
                </p>
              </section>

              <section className="premium-card">
                <h2 className="text-xl font-serif mb-4">How We Use Your Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your data is used to provide and improve our services, personalize your experience, 
                  and send you important updates. We never sell your personal information to third parties.
                </p>
              </section>

              <section className="premium-card">
                <h2 className="text-xl font-serif mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures including encryption, secure servers, 
                  and regular security audits to protect your information from unauthorized access.
                </p>
              </section>

              <section className="premium-card">
                <h2 className="text-xl font-serif mb-4">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to access, correct, or delete your personal data at any time. 
                  Contact us at privacy@wakey.app to exercise these rights or ask questions about our practices.
                </p>
              </section>

              <section className="premium-card">
                <h2 className="text-xl font-serif mb-4">Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies to enhance your experience, analyze usage patterns, and remember your preferences. 
                  You can control cookie settings in your browser.
                </p>
              </section>
            </div>
          </ScrollSection>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
