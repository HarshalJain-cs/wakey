import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Clock, Target, TrendingUp, Zap, CheckCircle, Calendar, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingElements from '@/components/effects/FloatingElements';
import previewDashboard from '@/assets/preview-dashboard.png';
import SEO from '@/components/SEO';

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track your productivity as it happens with live updating charts and metrics.',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Automatic time tracking that runs in the background without interrupting your flow.',
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set daily, weekly, and monthly goals and watch your progress in real-time.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Analysis',
    description: 'Understand your productivity patterns over time with detailed trend reports.',
  },
  {
    icon: Calendar,
    title: 'Daily Overview',
    description: 'Start each day with a clear view of your tasks, meetings, and focus time.',
  },
  {
    icon: PieChart,
    title: 'Category Breakdown',
    description: 'See exactly where your time goes with detailed category analysis.',
  },
];

const stats = [
  { value: '3.2x', label: 'Productivity increase' },
  { value: '4h+', label: 'Time saved weekly' },
  { value: '89%', label: 'Users hit goals' },
];

const Dashboard = () => {
  return (
    <div className="grain min-h-screen">
      <SEO
        title="Dashboard"
        description="Your productivity command center. Track time, set goals, and get real-time analytics all in one beautiful interface."
      />
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
                  Dashboard
                </motion.span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6">
                  Your productivity{' '}
                  <span className="gradient-text">command center</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Get a complete view of your work life. The Wakey Dashboard brings together
                  all your productivity data in one beautiful, actionable interface.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/checkout?plan=pro&billing=yearly" className="btn-primary inline-flex items-center group">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/features" className="btn-secondary">
                    View All Features
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
                <div className="relative rounded-2xl border border-border/50 overflow-hidden bg-card/80 backdrop-blur-sm shadow-2xl">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-muted-foreground flex-1 text-center">Wakey Dashboard</span>
                  </div>
                  <img
                    src={previewDashboard}
                    alt="Wakey Dashboard Preview"
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 py-16 border-y border-border/50 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl sm:text-5xl font-serif gradient-text mb-2">{stat.value}</div>
                  <p className="text-muted-foreground">{stat.label}</p>
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
                Everything at a <span className="gradient-text">glance</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Designed to give you instant insights without overwhelming you with data.
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
              <Zap className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-serif mb-4">
                Ready to take control?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join 10,000 productive humans who use Wakey to optimize their workday.
              </p>
              <Link to="/pricing" className="btn-primary inline-flex items-center group">
                View Pricing
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

export default Dashboard;