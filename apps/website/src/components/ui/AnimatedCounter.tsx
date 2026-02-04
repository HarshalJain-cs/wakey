import { useCountUp } from '@/hooks/useCountUp';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

const AnimatedCounter = ({
  end,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 2000,
  delay = 0,
  className = ''
}: AnimatedCounterProps) => {
  const { ref, formattedValue } = useCountUp({
    end,
    suffix,
    prefix,
    decimals,
    duration,
    delay
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className={className}
    >
      {formattedValue}
    </motion.div>
  );
};

export default AnimatedCounter;
