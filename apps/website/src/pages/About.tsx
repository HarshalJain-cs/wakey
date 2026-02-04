import { motion, useMotionValue, useTransform, animate, useInView, useScroll } from 'framer-motion';
import { Users, Target, Heart, Zap, CheckCircle, Clock, Star } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollSection from '@/components/effects/ScrollSection';
import SEO from '@/components/SEO';

const Counter = ({ value, suffix = '', prefix = '', decimals = 0, isInView }: { value: number; suffix?: string; prefix?: string; decimals?: number; isInView: boolean }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (decimals > 0) {
      return v.toFixed(decimals);
    }
    return Math.round(v).toLocaleString();
  });
  const [displayValue, setDisplayValue] = useState(decimals > 0 ? '0.0' : '0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const controls = animate(count, value, {
        duration: 2.5,
        ease: 'easeOut',
      });

      rounded.on('change', (v) => setDisplayValue(v));

      return controls.stop;
    }
  }, [isInView, value, count, rounded]);

  return (
    <span>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

const stats = [
  { value: 10000, suffix: '+', label: 'Productive Humans', icon: Users },
  { value: 2, suffix: 'M+', label: 'Tasks Completed', icon: CheckCircle },
  { value: 50000, suffix: '+', label: 'Hours Saved', icon: Clock },
  { value: 4.9, suffix: '/5', label: 'Average Rating', icon: Star, decimals: 1 },
];

const team = [
  { name: 'Harshal Jain', role: 'Founder', avatar: 'HJ' },
  { name: 'AI', role: 'Co-founder', avatar: '🤖' },
];

const values = [
  { icon: Target, title: 'Focus on Impact', description: 'We build features that genuinely help people.' },
  { icon: Heart, title: 'User First', description: 'Every decision starts with our users.' },
  { icon: Zap, title: 'Move Fast', description: 'Ship quickly, learn, iterate.' },
  { icon: Users, title: 'Team Spirit', description: 'Great products come from great teams.' },
];

const About = () => {
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const valuesRef = useRef(null);
  const teamRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });
  const valuesInView = useInView(valuesRef, { once: true, margin: '-100px' });
  const teamInView = useInView(teamRef, { once: true, margin: '-100px' });

  return (
    <div className="grain">
      <SEO 
        title="About Us" 
        description="Learn about Wakey's mission to help you achieve more. Meet our team and discover our values driving the future of productivity."
      />
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Parallax Hero Section */}
          <motion.div
            ref={heroRef}
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
            className="text-center mb-20 relative"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6"
            >
              Our mission is to help you <span className="gradient-text">achieve more</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              We're building the productivity tools we always wished existed.
            </motion.p>
          </motion.div>

          {/* Animated Stats Counters */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 40 }}
            animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={statsInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 30 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                className="premium-card text-center py-8"
              >
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)' }}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-serif gradient-text mb-2">
                  <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals || 0} isInView={statsInView} />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Our Story */}
          <ScrollSection fadeIn fadeOut parallax className="mb-16">
            <div className="premium-card">
              <h2 className="text-2xl font-serif mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                Wakey started in November 2025 when our founder was struggling to stay focused while working remotely. 
                After trying dozens of productivity apps and finding them either too complex or too simple, 
                the idea for Wakey was born. Our first beta version launched in January 2026, 
                and we're now helping 10,000 productive humans reclaim their time and boost their productivity.
              </p>
            </div>
          </ScrollSection>

          {/* Values Section with Scroll Trigger */}
          <ScrollSection fadeIn fadeOut parallax className="mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-serif mb-8 text-center"
            >
              Our Values
            </motion.h2>
            <div ref={valuesRef} className="grid sm:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30, y: 20 }}
                  animate={valuesInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: index % 2 === 0 ? -30 : 30, y: 20 }}
                  transition={{ delay: index * 0.15, duration: 0.6, ease: 'easeOut' }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  className="premium-card-hover"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)' }}>
                    <value.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-medium mb-1">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </ScrollSection>

          {/* Team Section with Scroll Trigger */}
          <ScrollSection fadeIn fadeOut parallax>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={teamInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-serif mb-8 text-center"
            >
              The Team
            </motion.h2>
            <div ref={teamRef} className="grid sm:grid-cols-2 gap-6 max-w-lg mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 40, rotateY: -15 }}
                  animate={teamInView ? { opacity: 1, y: 0, rotateY: 0 } : { opacity: 0, y: 40, rotateY: -15 }}
                  transition={{ delay: index * 0.12, duration: 0.6, ease: 'easeOut' }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="premium-card text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-medium text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)' }}
                  >
                    {member.avatar}
                  </motion.div>
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </ScrollSection>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
