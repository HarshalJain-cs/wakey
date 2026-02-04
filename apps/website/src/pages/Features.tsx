import { motion } from 'framer-motion';
import { Brain, BarChart3, Focus, Puzzle, Zap, Clock, Target, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollSection from '@/components/effects/ScrollSection';
import SEO from '@/components/SEO';

const features = [
  { icon: Brain, title: 'Smart Suggestions', description: 'AI analyzes your patterns and suggests optimal times for deep work.' },
  { icon: Sparkles, title: 'Auto Prioritization', description: 'Tasks are automatically ranked based on deadlines and importance.' },
  { icon: Target, title: 'Goal Prediction', description: 'See projected completion dates based on your velocity.' },
  { icon: BarChart3, title: 'Beautiful Analytics', description: 'Visualize your productivity with stunning charts and graphs.' },
  { icon: Clock, title: 'Time Tracking', description: 'Automatic time tracking with detailed project breakdowns.' },
  { icon: Focus, title: 'Distraction Blocking', description: 'Block distracting websites during focus sessions.' },
  { icon: Puzzle, title: '50+ Integrations', description: 'Connect with Slack, Notion, Trello, and more.' },
  { icon: Zap, title: 'Automation', description: 'Native integrations with Zapier and Make.' },
];

const Features = () => {
  return (
    <div className="grain">
      <SEO 
        title="Features" 
        description="Discover powerful productivity features including AI insights, focus mode, time tracking, and 50+ integrations to help you achieve more."
      />
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollSection fadeIn fadeOut parallax className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6">
              Powerful features for <span className="gradient-text">serious productivity</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to focus, track, and achieve more.
            </p>
          </ScrollSection>

          <ScrollSection fadeIn fadeOut parallax>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="premium-card-hover flex gap-4"
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)' }}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
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

export default Features;
