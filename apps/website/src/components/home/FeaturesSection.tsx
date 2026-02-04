import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, BarChart3, Focus, Puzzle, Zap, Shield, Clock, Layers, Sparkles, Target, TrendingUp, Battery, Bot, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSound } from '@/components/effects/SoundEffects';
import previewActivity from '@/assets/preview-activity.png';
import previewDashboard from '@/assets/preview-dashboard.png';
import ScrollSection from '@/components/effects/ScrollSection';

// Typewriter hook for JARVIS description
const useTypewriter = (text: string, speed: number = 50, startDelay: number = 500) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;
    
    timeout = setTimeout(() => {
      setIsTyping(true);
      const typeChar = () => {
        if (charIndex < text.length) {
          setDisplayText(text.slice(0, charIndex + 1));
          charIndex++;
          timeout = setTimeout(typeChar, speed);
        } else {
          setIsTyping(false);
        }
      };
      typeChar();
    }, startDelay);
    
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  
  return { displayText, isTyping };
};

// Typing animation component for "Everything you need to succeed"
const TypingHeading = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const fullText = "Everything you need to ";
  const ref = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let charIndex = 0;
          const typeChar = () => {
            if (charIndex <= fullText.length) {
              setDisplayText(fullText.slice(0, charIndex));
              charIndex++;
              setTimeout(typeChar, 50);
            }
          };
          typeChar();
        }
      },
      { threshold: 0.5 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [hasAnimated]);
  
  return (
    <h2 ref={ref} className="text-4xl sm:text-5xl lg:text-6xl font-serif">
      {displayText}
      {displayText.length < fullText.length && (
        <motion.span
          className="inline-block w-[3px] h-[1em] bg-primary ml-1 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
      {displayText.length === fullText.length && (
        <motion.span 
          className="gradient-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          succeed
        </motion.span>
      )}
    </h2>
  );
};

const tabs = [
  { id: 'ai', label: 'AI Insights', icon: Brain },
  { id: 'tracking', label: 'Analytics', icon: BarChart3 },
  { id: 'focus', label: 'Focus Mode', icon: Focus },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
];

const features = {
  ai: {
    title: 'Let AI optimize your workflow',
    description: 'Our AI analyzes your work patterns and suggests the best times for deep work, automatically prioritizes tasks, and predicts project timelines.',
    items: [
      { icon: Sparkles, title: 'Smart scheduling', desc: 'AI finds your optimal work windows' },
      { icon: Target, title: 'Auto-prioritization', desc: 'Tasks ranked by impact & urgency' },
      { icon: TrendingUp, title: 'Goal prediction', desc: 'Accurate timeline forecasting' },
      { icon: Battery, title: 'Energy matching', desc: 'Match tasks to energy levels' },
    ],
    gradient: 'from-primary via-primary/80 to-secondary',
    preview: previewDashboard,
    link: '/dashboard',
    linkText: 'Explore Dashboard',
  },
  tracking: {
    title: 'Beautiful, actionable analytics',
    description: 'Visualize your productivity with stunning charts. Understand where your time goes and make data-driven decisions to improve.',
    items: [
      { icon: BarChart3, title: 'Real-time dashboards', desc: 'Live productivity metrics' },
      { icon: Clock, title: 'Time breakdowns', desc: 'Detailed category analysis' },
      { icon: TrendingUp, title: 'Progress tracking', desc: 'Monitor goal completion' },
      { icon: Layers, title: 'Custom reports', desc: 'Export & share insights' },
    ],
    gradient: 'from-secondary via-secondary/80 to-primary',
    preview: previewActivity,
    link: '/analytics',
    linkText: 'View Analytics',
  },
  focus: {
    title: 'Eliminate distractions completely',
    description: 'Block distracting websites, batch notifications, and create the perfect environment for deep work with our focus mode.',
    items: [
      { icon: Shield, title: 'Website blocking', desc: 'Block distracting sites' },
      { icon: Clock, title: 'Notification batching', desc: 'Scheduled alert delivery' },
      { icon: Focus, title: 'Pomodoro timer', desc: 'Structured work sessions' },
      { icon: Sparkles, title: 'Ambient sounds', desc: 'Focus-enhancing audio' },
    ],
    gradient: 'from-primary via-purple-500 to-secondary',
    preview: previewDashboard,
    link: '/focus-mode',
    linkText: 'Try Focus Mode',
  },
  integrations: {
    title: 'Works with your favorite tools',
    description: 'Connect Wakey with the apps you already use. Sync calendars, import tasks, and automate your workflow.',
    items: [
      { icon: Clock, title: 'Calendar sync', desc: 'Google, Outlook & more' },
      { icon: Puzzle, title: '50+ integrations', desc: 'Connect all your tools' },
      { icon: Zap, title: 'API access', desc: 'Build custom workflows' },
      { icon: Layers, title: 'Zapier & Make', desc: 'Automate everything' },
    ],
    gradient: 'from-secondary via-orange-400 to-primary',
    preview: previewActivity,
    link: '/integrations',
    linkText: 'See Integrations',
  },
};

const miniFeatures = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Instant sync across devices' },
  { icon: Shield, title: 'Secure', desc: 'End-to-end encryption' },
  { icon: Clock, title: '24/7 Support', desc: 'Always here to help' },
  { icon: Layers, title: 'Scalable', desc: 'From solo to enterprise' },
];

// JARVIS external link - update this URL when ready
const JARVIS_URL = 'https://example.com';

const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const [isJarvisHovered, setIsJarvisHovered] = useState(false);
  const { playClick, playHover } = useSound();
  const activeFeature = features[activeTab as keyof typeof features];
  
  const jarvisDescription = "Your AI-powered personal assistant for ultimate productivity";
  const { displayText, isTyping } = useTypewriter(jarvisDescription, 40, 800);
  return (
    <ScrollSection 
      id="features" 
      className="relative py-32 px-6 overflow-hidden"
      fadeIn
      fadeOut
      parallax
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header with typing animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.span 
            className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Features
          </motion.span>
          <TypingHeading />
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for productive humans who demand the best.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                playClick();
              }}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all overflow-hidden ${
                activeTab === tab.id
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: activeTab === tab.id ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTab === tab.id && (
                <motion.div
                  className="absolute inset-0 bg-primary"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid lg:grid-cols-2 gap-16 items-start"
          >
            {/* Text & Feature Boxes */}
            <div>
              <motion.h3 
                className="text-3xl lg:text-4xl font-serif mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {activeFeature.title}
              </motion.h3>
              <motion.p 
                className="text-muted-foreground text-lg leading-relaxed mb-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {activeFeature.description}
              </motion.p>

              {/* CTA Button to dedicated page */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-10"
              >
                <Link
                  to={activeFeature.link}
                  onClick={playClick}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all group"
                >
                  {activeFeature.linkText}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              {/* Feature Boxes Grid */}
              <div className="grid grid-cols-2 gap-4">
                {activeFeature.items.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                    className="group p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:bg-card transition-all duration-300 cursor-default"
                    style={{
                      boxShadow: '0 4px 20px -5px hsl(0 0% 0% / 0.1)',
                    }}
                  >
                    <motion.div 
                      className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors"
                      whileHover={{ rotate: 10 }}
                    >
                      <item.icon className="w-5 h-5 text-primary" />
                    </motion.div>
                    <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Interactive Preview with Screenshots */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className={`absolute -inset-8 bg-gradient-to-br ${activeFeature.gradient} rounded-3xl blur-3xl opacity-20`}
                animate={{ scale: [1, 1.05, 1], rotate: [0, 1, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <div className="relative rounded-2xl border border-border/50 overflow-hidden bg-card/80 backdrop-blur-sm shadow-2xl">
                {/* Preview Header - macOS style */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <span className="text-xs text-muted-foreground px-3 py-1 rounded-md bg-muted/50">Wakey Dashboard</span>
                  </div>
                </div>
                
                {/* Screenshot - properly fitted */}
                <motion.div 
                  className="relative overflow-hidden bg-background"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.img 
                    key={activeTab}
                    src={activeFeature.preview}
                    alt={`${activeFeature.title} preview`}
                    className="w-full h-auto object-contain"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Mini features grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {miniFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="premium-card-hover text-center group cursor-default"
            >
              <motion.div 
                className="w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                whileHover={{ rotate: 10 }}
              >
                <feature.icon className="w-6 h-6 text-primary" />
              </motion.div>
              <h4 className="font-medium mb-1">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* JARVIS Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mt-20 mb-6 text-center"
        >
          <h3 className="text-2xl sm:text-3xl font-serif text-foreground">
            Meet your <span className="gradient-text">Assistant</span>
          </h3>
        </motion.div>

        {/* JARVIS Feature - Mystical Clickable Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.a
            href={JARVIS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            onMouseEnter={() => {
              setIsJarvisHovered(true);
              playHover();
            }}
            onMouseLeave={() => setIsJarvisHovered(false)}
            className="block group cursor-pointer relative overflow-hidden rounded-2xl"
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(90deg, hsl(217 91% 60%), hsl(280 80% 60%), hsl(45 93% 58%), hsl(217 91% 60%))',
                backgroundSize: '300% 100%',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Inner card background with holographic effect */}
            <div className="relative rounded-2xl bg-background/95 backdrop-blur-xl m-[1px] overflow-hidden">
              {/* Holographic/Iridescent overlay */}
              <motion.div
                className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `
                    linear-gradient(
                      135deg,
                      hsl(280 80% 60% / 0.2) 0%,
                      hsl(200 100% 60% / 0.3) 20%,
                      hsl(45 93% 58% / 0.2) 40%,
                      hsl(320 80% 60% / 0.3) 60%,
                      hsl(180 100% 50% / 0.2) 80%,
                      hsl(280 80% 60% / 0.2) 100%
                    )
                  `,
                  backgroundSize: '400% 400%',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Prismatic light refraction effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `
                    repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 10px,
                      hsl(280 80% 70% / 0.1) 10px,
                      hsl(280 80% 70% / 0.1) 20px
                    ),
                    repeating-linear-gradient(
                      -45deg,
                      transparent,
                      transparent 10px,
                      hsl(200 100% 60% / 0.1) 10px,
                      hsl(200 100% 60% / 0.1) 20px
                    )
                  `,
                }}
                animate={{
                  opacity: isJarvisHovered ? [0.2, 0.4, 0.2] : 0,
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Mystical floating orbs */}
              <motion.div
                className="absolute top-4 right-20 w-32 h-32 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, hsl(280 80% 60% / 0.3), transparent)' }}
                animate={{ 
                  scale: [1, 1.3, 1],
                  x: [0, 20, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-4 left-20 w-24 h-24 rounded-full blur-2xl"
                style={{ background: 'radial-gradient(circle, hsl(217 91% 60% / 0.4), transparent)' }}
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  y: [0, -15, 0],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full blur-xl"
                style={{ background: 'radial-gradient(circle, hsl(45 93% 58% / 0.3), transparent)' }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              />

              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, hsl(0 0% 100% / 0.15) 45%, hsl(0 0% 100% / 0.3) 50%, hsl(0 0% 100% / 0.15) 55%, transparent 60%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{
                  backgroundPosition: ['200% 0', '-200% 0'],
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              />

              {/* Particle dots */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${10 + i * 12}%`,
                    top: `${15 + (i % 4) * 20}%`,
                    width: i % 2 === 0 ? '3px' : '2px',
                    height: i % 2 === 0 ? '3px' : '2px',
                    background: i % 3 === 0 
                      ? 'hsl(280 80% 60%)' 
                      : i % 3 === 1 
                        ? 'hsl(200 100% 60%)' 
                        : 'hsl(45 93% 58%)',
                  }}
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.8, 1],
                  }}
                  transition={{
                    duration: 2.5 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
              
              <div className="relative flex items-center justify-between p-8 sm:p-10">
                <div className="flex items-center gap-6">
                  {/* Mystical icon container */}
                  <motion.div className="relative">
                    {/* Outer glow ring */}
                    <motion.div
                      className="absolute -inset-3 rounded-full opacity-60"
                      style={{ 
                        background: 'conic-gradient(from 0deg, hsl(217 91% 60%), hsl(280 80% 60%), hsl(45 93% 58%), hsl(217 91% 60%))',
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div className="absolute -inset-3 rounded-full bg-background/80 backdrop-blur-sm" />
                    
                    {/* Icon container */}
                    <motion.div 
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(280 80% 60%) 50%, hsl(45 93% 58%) 100%)',
                      }}
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      animate={{ 
                        boxShadow: [
                          '0 0 30px hsl(280 80% 60% / 0.4), 0 0 60px hsl(217 91% 60% / 0.2)',
                          '0 0 50px hsl(280 80% 60% / 0.6), 0 0 80px hsl(217 91% 60% / 0.4)',
                          '0 0 30px hsl(280 80% 60% / 0.4), 0 0 60px hsl(217 91% 60% / 0.2)',
                        ]
                      }}
                      transition={{ boxShadow: { duration: 2.5, repeat: Infinity } }}
                    >
                      <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <motion.h3 
                        className="text-2xl sm:text-3xl font-serif bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent"
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        style={{ backgroundSize: '200% auto' }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        JARVIS
                      </motion.h3>
                      
                      {/* Pulsing Beta Badge */}
                      <motion.span
                        className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        animate={{
                          boxShadow: [
                            '0 0 0 0 hsl(280 80% 60% / 0.4)',
                            '0 0 0 8px hsl(280 80% 60% / 0)',
                          ],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {/* Inner pulse dot */}
                        <motion.span
                          className="w-2 h-2 rounded-full bg-purple-400"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.7, 1],
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span>Beta</span>
                      </motion.span>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md h-6 mt-2">
                      {displayText}
                      {isTyping && (
                        <motion.span
                          className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-6">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">AI Powered</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Intelligent</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">Adaptive</span>
                    </div>
                  </div>
                </div>
                
                <motion.div
                  className="hidden sm:flex items-center gap-3"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                >
                  <motion.span 
                    className="text-sm font-medium bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
                  >
                    Explore JARVIS
                  </motion.span>
                  <motion.div
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/30"
                    whileHover={{ scale: 1.1 }}
                    animate={{
                      boxShadow: ['0 0 0 0 hsl(217 91% 60% / 0)', '0 0 0 8px hsl(217 91% 60% / 0.1)', '0 0 0 0 hsl(217 91% 60% / 0)'],
                    }}
                    transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                  >
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.a>
        </motion.div>
      </div>
    </ScrollSection>
  );
};

export default FeaturesSection;