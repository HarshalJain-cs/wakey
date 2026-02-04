import { useState, useMemo, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Clock, DollarSign, Coffee, Tv, ArrowRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ScrollSection from '@/components/effects/ScrollSection';
const AnimatedNumber = ({ 
  value, 
  prefix = '', 
  suffix = '',
  decimals = 0 
}: { 
  value: number; 
  prefix?: string; 
  suffix?: string;
  decimals?: number;
}) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { 
    stiffness: 100, 
    damping: 30,
    mass: 1
  });
  const displayValue = useTransform(springValue, (latest) => {
    if (decimals > 0) {
      return latest.toFixed(decimals);
    }
    return Math.round(latest).toLocaleString();
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <span>
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
};

const ROICalculatorSection = () => {
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [distractionPercent, setDistractionPercent] = useState(25);

  const savings = useMemo(() => {
    const wakeyEfficiency = 0.7;
    const hoursLostPerDay = (hoursPerDay * distractionPercent) / 100;
    const hoursSavedPerDay = hoursLostPerDay * wakeyEfficiency;
    const workingDaysPerYear = 260;
    const hoursSavedPerYear = hoursSavedPerDay * workingDaysPerYear;
    const moneySavedPerYear = hoursSavedPerYear * hourlyRate;
    const coffeePrice = 5;
    const coffeesSaved = Math.round(moneySavedPerYear / coffeePrice);
    const episodeDuration = 0.75;
    const episodesSaved = Math.round(hoursSavedPerYear / episodeDuration);

    return {
      hoursPerDay: hoursSavedPerDay,
      moneyPerYear: moneySavedPerYear,
      coffees: coffeesSaved,
      episodes: episodesSaved,
    };
  }, [hoursPerDay, hourlyRate, distractionPercent]);

  const statCards = [
    {
      icon: Clock,
      value: savings.hoursPerDay,
      prefix: '',
      suffix: ' hours/day',
      decimals: 1,
      gradient: 'from-primary to-primary/60',
    },
    {
      icon: DollarSign,
      value: savings.moneyPerYear,
      prefix: '$',
      suffix: '/year',
      decimals: 0,
      gradient: 'from-secondary to-secondary/60',
    },
    {
      icon: Coffee,
      value: savings.coffees,
      prefix: '',
      suffix: ' coffees',
      decimals: 0,
      gradient: 'from-primary to-secondary',
    },
    {
      icon: Tv,
      value: savings.episodes,
      prefix: '',
      suffix: ' episodes',
      decimals: 0,
      gradient: 'from-secondary to-primary',
    },
  ];

  return (
    <ScrollSection className="relative py-32 px-6 overflow-hidden" fadeIn fadeOut parallax>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
      <motion.div
        className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full blur-3xl -translate-y-1/2"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(var(--secondary) / 0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
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
            ROI Calculator
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif">
            How Much Could <span className="gradient-text">You Save?</span>
          </h2>
        </motion.div>

        {/* Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="premium-card p-8 md:p-12"
        >
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Input Controls */}
            <div className="space-y-8">
              {/* Hours per day */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Hours worked per day</label>
                  <span className="text-lg font-semibold text-primary">{hoursPerDay}h</span>
                </div>
                <Slider
                  value={[hoursPerDay]}
                  onValueChange={(value) => setHoursPerDay(value[0])}
                  min={4}
                  max={16}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Hourly rate */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Your hourly rate</label>
                  <span className="text-lg font-semibold text-secondary">${hourlyRate}</span>
                </div>
                <Slider
                  value={[hourlyRate]}
                  onValueChange={(value) => setHourlyRate(value[0])}
                  min={15}
                  max={250}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Distraction percentage */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Time lost to distractions</label>
                  <span className="text-lg font-semibold text-muted-foreground">{distractionPercent}%</span>
                </div>
                <Slider
                  value={[distractionPercent]}
                  onValueChange={(value) => setDistractionPercent(value[0])}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <p className="text-center text-muted-foreground mb-6">
                With Wakey, you could save:
              </p>

              <div className="grid grid-cols-2 gap-4">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="premium-card-hover p-5 text-center group"
                  >
                    <div
                      className={`w-10 h-10 mx-auto mb-3 rounded-full bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}
                    >
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xl md:text-2xl font-serif gradient-text">
                      <AnimatedNumber 
                        value={stat.value} 
                        prefix={stat.prefix}
                        decimals={stat.decimals}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stat.suffix}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="pt-4"
              >
                <Link to="/signup">
                  <Button className="w-full btn-primary group">
                    Start Saving Time
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </ScrollSection>
  );
};

export default ROICalculatorSection;
