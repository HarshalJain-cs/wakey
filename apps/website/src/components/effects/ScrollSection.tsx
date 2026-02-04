import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
  /** Enable parallax effect (content moves and fades on scroll) */
  parallax?: boolean;
  /** Enable fade-in when entering viewport */
  fadeIn?: boolean;
  /** Enable fade-out when leaving viewport (requires parallax) */
  fadeOut?: boolean;
  /** Parallax movement distance in pixels */
  parallaxDistance?: number;
  /** Fade-in delay in seconds */
  fadeInDelay?: number;
  /** Custom id for the section */
  id?: string;
}

/**
 * ScrollSection - A reusable component that provides scroll-triggered animations
 * 
 * Features:
 * - Fade-in on viewport entry
 * - Parallax movement effect (content moves down as you scroll)
 * - Fade-out as content scrolls away
 * 
 * Usage:
 * <ScrollSection fadeIn fadeOut parallax>
 *   <YourContent />
 * </ScrollSection>
 */
const ScrollSection = ({
  children,
  className = '',
  parallax = true,
  fadeIn = true,
  fadeOut = true,
  parallaxDistance = 100,
  fadeInDelay = 0,
  id,
}: ScrollSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'], // Track from when section enters to when it leaves
  });

  // Parallax effect - content moves down as you scroll through
  const y = useTransform(
    scrollYProgress, 
    [0, 0.5, 1], 
    parallax ? [-parallaxDistance * 0.3, 0, parallaxDistance] : [0, 0, 0]
  );
  
  // Opacity: fade in from 0 to 1 as it enters (0-0.3), stay at 1 (0.3-0.7), fade out to 0 as it leaves (0.7-1)
  const opacity = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    [
      fadeIn ? 0 : 1, 
      1, 
      1, 
      fadeOut ? 0 : 1
    ]
  );

  // Scale effect - subtle zoom
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [
      fadeIn ? 0.95 : 1,
      1,
      1,
      fadeOut ? 0.98 : 1
    ]
  );

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      className={className}
      style={{
        y,
        opacity,
        scale,
      }}
      initial={fadeIn ? { opacity: 0, y: 30 } : undefined}
      whileInView={fadeIn ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: false, margin: '-10%' }}
      transition={{ 
        duration: 0.8, 
        delay: fadeInDelay,
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      {children}
    </motion.section>
  );
};

export default ScrollSection;
