import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollSection from '@/components/effects/ScrollSection';

const Terms = () => {
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
                <span className="gradient-text">Terms of Service</span>
              </h1>
              <p className="text-muted-foreground">Last updated: January 2026</p>
            </motion.div>
          </ScrollSection>

          <ScrollSection fadeIn fadeOut parallax>
            <div className="prose prose-invert max-w-none space-y-8">
              <section className="premium-card">
                <h2 className="text-xl font-serif mb-4">Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using Wakey, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section className="premium-card">
                <h2 className="text-xl font-serif mb-4">Use of Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You may use Wakey for lawful purposes only. You agree not to misuse our services, 
                  attempt to gain unauthorized access, or interfere with other users' experiences.
                </p>
              </section>

              <section className="premium-card">
                <h2 className="text-xl font-serif mb-4">Account Responsibilities</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for maintaining the security of your account credentials. 
                  Notify us immediately if you suspect unauthorized access to your account.
                </p>
              </section>

              <section className="premium-card">
                <h2 className="text-xl font-serif mb-4">Subscription & Billing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Paid subscriptions are billed in advance. You may cancel at any time, and your 
                  access will continue until the end of the current billing period.
                </p>
              </section>

              <section className="premium-card">
                <h2 className="text-xl font-serif mb-4">Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Wakey and its original content, features, and functionality are owned by us and 
                  protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section className="premium-card">
                <h2 className="text-xl font-serif mb-4">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Wakey is provided "as is" without warranties. We shall not be liable for any 
                  indirect, incidental, or consequential damages arising from your use of our services.
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

export default Terms;
