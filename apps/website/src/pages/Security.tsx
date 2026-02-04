import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, Key, CheckCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollSection from '@/components/effects/ScrollSection';

const securityFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All data is encrypted in transit and at rest using AES-256 encryption.',
  },
  {
    icon: Shield,
    title: 'SOC 2 Compliant',
    description: 'We maintain rigorous security standards with annual third-party audits.',
  },
  {
    icon: Eye,
    title: 'Privacy First',
    description: 'Your data is yours. We never sell or share personal information.',
  },
  {
    icon: Server,
    title: 'Secure Infrastructure',
    description: 'Hosted on enterprise-grade cloud infrastructure with 99.9% uptime.',
  },
  {
    icon: Key,
    title: 'Two-Factor Authentication',
    description: 'Protect your account with an additional layer of security.',
  },
  {
    icon: CheckCircle,
    title: 'Regular Security Audits',
    description: 'Continuous vulnerability testing and penetration testing.',
  },
];

const Security = () => {
  return (
    <div className="grain">
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollSection fadeIn fadeOut parallax className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl sm:text-5xl font-serif mb-6">
                Your security is our <span className="gradient-text">priority</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We take security seriously. Here's how we protect your data and privacy.
              </p>
            </motion.div>
          </ScrollSection>

          <ScrollSection fadeIn fadeOut parallax>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="premium-card-hover"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)',
                    }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </ScrollSection>

          <ScrollSection fadeIn fadeOut parallax className="mt-16">
            <div className="premium-card text-center">
              <h2 className="text-2xl font-serif mb-4">Report a Vulnerability</h2>
              <p className="text-muted-foreground mb-6">
                Found a security issue? We appreciate responsible disclosure. 
                Contact our security team at security@wakey.app
              </p>
              <a
                href="mailto:security@wakey.app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
              >
                Contact Security Team
              </a>
            </div>
          </ScrollSection>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Security;
