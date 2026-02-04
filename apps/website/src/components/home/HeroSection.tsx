import { motion, useScroll, useTransform, useMotionValue, useInView, animate } from 'framer-motion';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSound } from '@/components/effects/SoundEffects';
import { useAuth } from '@/contexts/AuthContext';
import { useRef, useEffect, useState } from 'react';

const stats = [
  { value: 10000, label: 'Productive humans', suffix: '+', display: '10K' },
  { value: 2000000, label: 'Tasks completed', suffix: '+', display: '2M' },
  { value: 99.9, label: 'Uptime', suffix: '%', decimals: 1 },
];

// Counter component for animated numbers
const Counter = ({
  value,
  suffix = '',
  decimals = 0,
  isInView
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  isInView: boolean;
}) => {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      if (value >= 1000000) {
        setDisplayValue((latest / 1000000).toFixed(1) + 'M');
      } else if (value >= 1000) {
        setDisplayValue(Math.round(latest / 1000) + 'K');
      } else {
        setDisplayValue(latest.toFixed(decimals));
      }
    });

    return () => unsubscribe();
  }, [motionValue, value, decimals]);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      animate(motionValue, value, {
        duration: 2.5,
        ease: [0.16, 1, 0.3, 1],
      });
    }
  }, [isInView, motionValue, value]);

  return <>{displayValue}{suffix}</>;
};

// Stats section with scroll-triggered counters - positioned below hero
const StatsSection = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(statsRef, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={statsRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="py-24 flex flex-wrap justify-center gap-16 bg-gradient-to-b from-transparent via-background/50 to-background"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="text-center group cursor-default"
        >
          <motion.div
            className="text-4xl sm:text-5xl font-serif gradient-text"
            whileHover={{ scale: 1.1 }}
          >
            <Counter
              value={stat.value}
              suffix={stat.suffix}
              decimals={stat.decimals || 0}
              isInView={isInView}
            />
          </motion.div>
          <div className="text-sm text-muted-foreground mt-2 group-hover:text-foreground/70 transition-colors">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
};

const HeroSection = () => {
  const { playClick } = useSound();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    playClick();
  };

  return (
    <>
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(217 91% 60% / 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(45 93% 58% / 0.1) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(217 91% 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(217 91% 60%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div style={{ y, opacity }} className="max-w-5xl mx-auto w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8 backdrop-blur-sm cursor-default"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-4 h-4 text-primary mr-2" />
              </motion.div>
              <span className="text-sm text-foreground/80">Now with AI-powered insights</span>
              <motion.span
                className="ml-2 w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-lg sm:text-xl font-medium tracking-widest text-primary mb-4"
            >
              WAKEY WAKEY
            </motion.p>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-serif leading-[1.1] text-balance"
            >
              Focus on what{' '}
              <span className="relative inline-block">
                <span className="gradient-text">matters</span>
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            </motion.h1>

            {/* Wake up line */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-4 text-sm sm:text-base font-semibold tracking-[0.3em] text-muted-foreground/80 uppercase"
            >
              Wake Up To Reality
            </motion.p>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Wakey helps you stay productive with intelligent time tracking,
              AI-powered insights, and beautiful analytics that help you achieve more.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={user ? "/dashboard" : "/signup"}
                  className="btn-primary inline-flex items-center justify-center group text-base relative overflow-hidden"
                  onClick={playClick}
                >
                  <span className="relative z-10 flex items-center">
                    {user ? "Go to Dashboard" : "Unlock Your Productivity"}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
              <motion.button
                onClick={scrollToFeatures}
                className="btn-secondary inline-flex items-center justify-center text-base group"
                whileHover={{ scale: 1.02, borderColor: 'hsl(217 91% 60% / 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                Learn more
                <ChevronDown className="ml-2 w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </motion.button>
            </motion.div>

          </motion.div>
        </motion.div>


        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToFeatures}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 group"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          whileHover={{ scale: 1.2 }}
        >
          <div className="relative">
            <ChevronDown className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/30"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.button>
      </section>

      {/* Stats Section - Below fold, visible when scrolled */}
      <StatsSection />
    </>
  );
};

export default HeroSection;
