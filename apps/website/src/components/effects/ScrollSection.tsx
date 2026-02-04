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
  parallax = false, // Disabled by default for performance
  fadeIn = true,
  fadeOut = false, // Disabled by default for performance
  parallaxDistance = 50, // Reduced distance
  fadeInDelay = 0,
  id,
}: ScrollSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  // Only track scroll if parallax or fadeOut is enabled
  const shouldTrackScroll = parallax || fadeOut;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Simplified parallax - only if enabled
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    parallax ? [0, parallaxDistance * 0.5] : [0, 0]
  );

  // Simplified opacity - only fade out if enabled
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.9, 1],
    [fadeIn ? 0.3 : 1, 1, 1, fadeOut ? 0.3 : 1]
  );

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      className={className}
      style={shouldTrackScroll ? { y, opacity } : undefined}
      initial={fadeIn ? { opacity: 0, y: 20 } : undefined}
      whileInView={fadeIn ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: '-5%' }} // once: true prevents re-triggering
      transition={{
        duration: 0.4,
        delay: fadeInDelay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.section>
  );
};

export default ScrollSection;
