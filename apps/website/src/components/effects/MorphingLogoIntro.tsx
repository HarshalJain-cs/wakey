import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface MorphingLogoIntroProps {
  onComplete: () => void;
}

const MorphingLogoIntro = ({ onComplete }: MorphingLogoIntroProps) => {
  useEffect(() => {
    const completeTimer = setTimeout(onComplete, 4000);

    const handleSkip = () => {
      clearTimeout(completeTimer);
      onComplete();
    };

    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);

    return () => {
      clearTimeout(completeTimer);
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Cinematic top light beam */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 30%, transparent 70%)',
        }}
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Subtle ambient glow behind text */}
      <motion.div
        className="absolute w-[800px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 60%)',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
      />

      {/* WAKEY text with cinematic entrance */}
      <motion.h1
        className="text-7xl md:text-9xl font-bold text-white tracking-[0.3em] md:tracking-[0.5em] relative z-10"
        style={{
          textShadow: '0 0 60px rgba(255,255,255,0.3), 0 0 120px rgba(255,255,255,0.1)',
        }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 2,
          delay: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        WAKEY
      </motion.h1>

      {/* Bottom vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      <motion.p
        className="absolute bottom-8 text-white/30 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        Press any key to skip
      </motion.p>
    </motion.div>
  );
};

export default MorphingLogoIntro;
