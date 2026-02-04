import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader2, Mail, Sparkles } from 'lucide-react';
import { useSound } from '@/components/effects/SoundEffects';
import ScrollSection from '@/components/effects/ScrollSection';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const { playClick, playSuccess } = useSound();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    playClick();
    setStatus('loading');
    await new Promise(resolve => setTimeout(resolve, 1200));
    setStatus('success');
    playSuccess();
    setEmail('');
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <ScrollSection className="relative py-32 px-6 overflow-hidden" fadeIn fadeOut parallax>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(217 91% 60% / 0.1) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(45 93% 58% / 0.1) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-8 flex items-center justify-center"
          >
            <Mail className="w-8 h-8 text-primary" />
          </motion.div>

          <motion.span 
            className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Newsletter
          </motion.span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif mb-6">
            Stay in the loop
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Get productivity tips, product updates, and exclusive offers delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="relative">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-primary/10 border border-primary/20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
                <span className="text-foreground font-medium">Thanks for subscribing!</span>
                <Sparkles className="w-4 h-4 text-secondary" />
              </motion.div>
            ) : (
              <motion.div 
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
                    required
                  />
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, hsl(217 91% 60% / 0.1) 0%, transparent 50%)',
                    }}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary inline-flex items-center justify-center gap-2 px-8 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </form>

          <motion.p 
            className="mt-6 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            No spam, ever. Unsubscribe anytime.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-8 mt-12"
          >
            {['10K+ subscribers', 'Weekly digest', 'Exclusive tips'].map((badge, i) => (
              <motion.div 
                key={badge}
                className="flex items-center gap-2 text-sm text-muted-foreground"
                whileHover={{ color: 'hsl(217 91% 60%)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {badge}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </ScrollSection>
  );
};

export default NewsletterSection;
