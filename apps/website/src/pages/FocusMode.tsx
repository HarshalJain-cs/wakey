import { motion } from 'framer-motion';
import { ArrowRight, Focus, Shield, Clock, Volume2, Bell, Sparkles, Timer, Moon, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingElements from '@/components/effects/FloatingElements';
import previewDashboard from '@/assets/preview-dashboard.png';

const features = [
  {
    icon: Shield,
    title: 'Website Blocking',
    description: 'Automatically block distracting websites during focus sessions. Customize your blocklist or use our AI suggestions.',
  },
  {
    icon: Bell,
    title: 'Notification Batching',
    description: 'Group notifications and receive them at scheduled intervals to maintain your flow state.',
  },
  {
    icon: Timer,
    title: 'Pomodoro Timer',
    description: 'Built-in Pomodoro technique with customizable work/break intervals and automatic tracking.',
  },
  {
    icon: Volume2,
    title: 'Ambient Sounds',
    description: 'Choose from a library of focus-enhancing soundscapes: rain, cafe, white noise, and more.',
  },
  {
    icon: Moon,
    title: 'Do Not Disturb',
    description: 'System-wide DND mode that syncs across all your devices and apps.',
  },
  {
    icon: Headphones,
    title: 'Music Integration',
    description: 'Connect Spotify or Apple Music for automatic focus playlist switching.',
  },
];

const pomodoroPresets = [
  { name: 'Classic', work: 25, break: 5 },
  { name: 'Long Focus', work: 50, break: 10 },
  { name: 'Quick Sprint', work: 15, break: 3 },
  { name: 'Deep Work', work: 90, break: 20 },
];

const FocusMode = () => {
  return (
    <div className="grain min-h-screen">
      <FloatingElements />
      <Navbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-6 py-24 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.span 
                  className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Focus Mode
                </motion.span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6">
                  Eliminate{' '}
                  <span className="gradient-text">distractions</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Create the perfect environment for deep work. Block distractions, 
                  manage notifications, and enter a state of flow with Wakey's Focus Mode.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup" className="btn-primary inline-flex items-center group">
                    Try Focus Mode
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/features" className="btn-secondary">
                    Learn More
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-8 bg-gradient-to-br from-purple-500/20 to-primary/20 rounded-3xl blur-3xl" />
                <div className="relative rounded-2xl border border-border/50 overflow-hidden bg-card/80 backdrop-blur-sm shadow-2xl">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-muted-foreground flex-1 text-center">Focus Timer</span>
                  </div>
                  <img 
                    src={previewDashboard} 
                    alt="Focus Mode Preview" 
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pomodoro Presets */}
        <section className="px-6 py-16 border-y border-border/50 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-serif mb-2">Pomodoro Presets</h2>
              <p className="text-muted-foreground">Choose a timer that fits your workflow</p>
            </motion.div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {pomodoroPresets.map((preset, index) => (
                <motion.div
                  key={preset.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className="p-6 rounded-xl border border-border/50 bg-card/50 text-center cursor-pointer hover:border-primary/40 transition-all"
                >
                  <h3 className="font-medium mb-2">{preset.name}</h3>
                  <div className="text-3xl font-serif gradient-text mb-1">{preset.work}m</div>
                  <p className="text-sm text-muted-foreground">{preset.break}m break</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-serif mb-4">
                Tools for <span className="gradient-text">deep work</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create distraction-free focus sessions.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="premium-card-hover group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 bg-gradient-to-b from-transparent to-muted/20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Focus className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-serif mb-4">
                Enter your flow state
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Start your first focus session and experience the difference.
              </p>
              <Link to="/signup" className="btn-primary inline-flex items-center group">
                Start Focusing
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FocusMode;