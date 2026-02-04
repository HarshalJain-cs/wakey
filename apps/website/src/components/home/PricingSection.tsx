import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '@/components/effects/SoundEffects';
import { useAuth } from '@/contexts/AuthContext';
import ScrollSection from '@/components/effects/ScrollSection';

interface Plan {
  name: string;
  description: string;
  priceWeekly: number;
  priceYearly: number;
  features: string[];
  cta: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Free',
    description: 'For individuals getting started',
    priceWeekly: 0,
    priceYearly: 0,
    features: ['3 projects', 'Basic analytics', 'Mobile app', 'Email support'],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    description: 'For professionals',
    priceWeekly: 2.5,
    priceYearly: 100,
    features: ['Unlimited projects', 'AI insights', 'Focus mode', 'Priority support', 'Integrations'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Team',
    description: 'For growing teams',
    priceWeekly: 7,
    priceYearly: 150,
    features: ['Everything in Pro', 'Team analytics', 'Admin dashboard', 'SSO', 'API access'],
    cta: 'Contact Sales',
  },
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);
  const { playClick, playToggle } = useSound();
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();

  const handlePlanClick = (plan: Plan) => {
    playClick();

    if (plan.name === 'Free') {
      // Free plan goes to coming-soon page
      navigate('/coming-soon');
      return;
    }

    if (plan.name === 'Team') {
      if (isPremium) {
        // Already premium, go to dashboard
        navigate('/dashboard');
        return;
      }

      const billingPeriod = isYearly ? 'yearly' : 'weekly';

      if (user) {
        // Go directly to checkout
        navigate(`/checkout?plan=team&billing=${billingPeriod}`);
      } else {
        // Store redirect destination and go to signup
        localStorage.setItem('auth_redirect', `/checkout?plan=team&billing=${billingPeriod}`);
        navigate('/signup');
      }
      return;
    }

    if (plan.name === 'Pro') {
      if (isPremium) {
        // Already premium, go to dashboard
        navigate('/dashboard');
        return;
      }

      const billingPeriod = isYearly ? 'yearly' : 'weekly';

      if (user) {
        // Go directly to checkout
        navigate(`/checkout?plan=pro&billing=${billingPeriod}`);
      } else {
        // Store redirect destination and go to signup
        localStorage.setItem('auth_redirect', `/checkout?plan=pro&billing=${billingPeriod}`);
        navigate('/signup');
      }
    }
  };

  const getButtonText = (plan: Plan) => {
    if (plan.name === 'Pro' && isPremium) {
      return 'Current Plan';
    }
    return plan.cta;
  };

  return (
    <ScrollSection className="relative py-32 px-6 overflow-hidden" fadeIn fadeOut parallax>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(45 93% 58% / 0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Pricing
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif">
            Simple <span className="gradient-text">pricing</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Start free, upgrade when you're ready.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex justify-center items-center gap-4 mb-16"
        >
          <span className={`text-sm transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Weekly
          </span>
          <motion.button
            onClick={() => { setIsYearly(!isYearly); playToggle(); }}
            className={`relative w-14 h-7 rounded-full transition-colors ${isYearly ? 'bg-primary' : 'bg-muted'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ x: isYearly ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
          <span className={`text-sm transition-colors flex items-center gap-2 ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <motion.span
              className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full"
              animate={{ scale: isYearly ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              Save 25%
            </motion.span>
          </span>
        </motion.div>

        {/* 3D Perspective Container */}
        <motion.div
          style={{ perspective: 1000 }}
          className="relative"
        >
          <motion.div
            className="max-w-5xl mx-auto border border-border/30 p-3 md:p-6 bg-background/50 backdrop-blur-sm rounded-[30px]"
            initial={{ opacity: 0, y: 60, rotateX: 0, scale: 1 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 16, scale: 1.04 }}
            viewport={{ once: true }}
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px, rgba(0, 0, 0, 0.29) 0px 9px 20px, rgba(0, 0, 0, 0.26) 0px 37px 37px, rgba(0, 0, 0, 0.15) 0px 84px 50px, rgba(0, 0, 0, 0.04) 0px 149px 60px, rgba(0, 0, 0, 0.01) 0px 233px 65px',
              transformStyle: 'preserve-3d',
            }}
            whileHover={{ rotateX: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="h-full w-full overflow-hidden rounded-2xl bg-card/50 md:rounded-2xl">
              {/* Plans */}
              <div className="grid md:grid-cols-3 gap-6 h-full p-4 md:p-6">
                {plans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ y: -5 }}
                    className={`relative p-6 md:p-8 flex flex-col h-full rounded-xl border transition-colors ${plan.popular ? 'border-primary/50 bg-primary/5' : 'border-border/30 bg-background/30'}`}
                  >
                    {plan.popular && (
                      <motion.div
                        className="absolute -top-4 left-1/2 -translate-x-1/2"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                      >
                        <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-4 py-1.5 rounded-full shadow-lg">
                          <Sparkles className="w-3 h-3" />
                          Most Popular
                        </span>
                      </motion.div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-serif">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                    </div>

                    <div className="text-center mb-6 pb-6 border-b border-border/30">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isYearly ? 'yearly' : 'monthly'}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-end justify-center gap-1"
                        >
                          <span className="text-4xl font-serif">
                            ${isYearly ? plan.priceYearly : plan.priceWeekly}
                          </span>
                          <span className="text-muted-foreground mb-1">{isYearly ? '/yr' : '/wk'}</span>
                        </motion.div>
                      </AnimatePresence>
                      {!isYearly && plan.priceWeekly > 0 && (
                        <motion.p
                          className="text-xs text-muted-foreground mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          Billed weekly
                        </motion.p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <motion.li
                          key={feature}
                          className="flex items-center gap-3 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                        >
                          <motion.div
                            className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                            whileHover={{ scale: 1.2 }}
                          >
                            <Check className="w-3 h-3 text-primary" />
                          </motion.div>
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <button
                        onClick={() => handlePlanClick(plan)}
                        disabled={plan.name === 'Pro' && isPremium}
                        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-all group ${plan.popular
                            ? 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50'
                            : 'border border-border/50 hover:border-border hover:bg-muted/50 text-foreground'
                          }`}
                      >
                        {getButtonText(plan)}
                        {!(plan.name === 'Pro' && isPremium) && (
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        )}
                      </button>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </ScrollSection>
  );
};

export default PricingSection;
