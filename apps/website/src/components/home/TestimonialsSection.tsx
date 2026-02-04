import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useEffect, useState } from 'react';
import ScrollSection from '@/components/effects/ScrollSection';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Product Manager, Zepto',
    content: 'Wakey has completely transformed how I manage my day. The AI insights are incredibly accurate and have helped me find 3 extra hours per week.',
    rating: 5,
    avatar: 'SC',
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    role: 'Founder, TechStart',
    content: 'As a founder, time is my most precious resource. Wakey helps me stay accountable and focused on what truly matters.',
    rating: 5,
    avatar: 'MJ',
  },
  {
    id: 3,
    name: 'Priyanshi Jain',
    role: 'Senior Developer, Google',
    content: "The focus mode is a game-changer. I've seen a 40% increase in my deep work time since I started using Wakey.",
    rating: 5,
    avatar: 'PJ',
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Creative Director, Dharma Productions',
    content: 'Beautiful design meets powerful functionality. Wakey understands how creative professionals work.',
    rating: 5,
    avatar: 'DK',
  },
  {
    id: 5,
    name: 'Harya Goenka',
    role: 'Student, Stanford',
    content: 'Between classes, assignments, and extracurriculars, staying focused was impossible. Wakey helped me ace my finals while still having time for what matters.',
    rating: 5,
    avatar: 'HG',
  },
];

const Counter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: 'easeOut',
    });

    rounded.on('change', (v) => setDisplayValue(v));

    return controls.stop;
  }, [value, count, rounded]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
};

const TestimonialsSection = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <ScrollSection className="relative py-32 px-6 bg-card/30 overflow-hidden" fadeIn fadeOut parallax>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <motion.div
        className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(217 91% 60% / 0.1) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
            Testimonials
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif">
            Loved by <span className="gradient-text">10,000 productive humans</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Join productive humans who've transformed their workflow.
          </p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-12 mt-12"
          >
            <div className="text-center">
              <div className="text-3xl font-serif gradient-text">
                <Counter value={10} suffix="K" />
              </div>
              <p className="text-sm text-muted-foreground">Productive Humans</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-serif gradient-text">
                <Counter value={4} suffix=".9" />
              </div>
              <p className="text-sm text-muted-foreground">App Store Rating</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-serif gradient-text">
                <Counter value={98} suffix="%" />
              </div>
              <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredId(testimonial.id)}
              onHoverEnd={() => setHoveredId(null)}
              whileHover={{ y: -8, scale: 1.02 }}
              className="premium-card-hover relative group"
            >
              {/* Quote icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Quote className="w-4 h-4 text-primary" />
              </motion.div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 + i * 0.05 }}
                  >
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                  </motion.div>
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6 group-hover:text-foreground/90 transition-colors">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium text-white"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)',
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {testimonial.avatar}
                </motion.div>
                <div>
                  <div className="font-medium text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>

              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, hsl(217 91% 60% / 0.1) 0%, transparent 50%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredId === testimonial.id ? 1 : 0 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom row - 2 cards centered */}
        <div className="grid md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
          {testimonials.slice(3, 5).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="premium-card-hover relative group"
            >
              <motion.div
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Quote className="w-4 h-4 text-primary" />
              </motion.div>

              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium text-white"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)',
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {testimonial.avatar}
                </motion.div>
                <div>
                  <div className="font-medium text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ScrollSection>
  );
};

export default TestimonialsSection;
