import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, PieChart, TrendingUp, Calendar, Download, Share2, FileText, Layers, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingElements from '@/components/effects/FloatingElements';
import previewActivity from '@/assets/preview-activity.png';

const features = [
  {
    icon: PieChart,
    title: 'Category Analysis',
    description: 'See exactly how your time is distributed across different projects, apps, and categories.',
  },
  {
    icon: TrendingUp,
    title: 'Productivity Trends',
    description: 'Track your productivity over days, weeks, and months. Identify patterns and optimize.',
  },
  {
    icon: Calendar,
    title: 'Historical Data',
    description: 'Access your complete productivity history. Compare time periods and measure growth.',
  },
  {
    icon: Download,
    title: 'Export Reports',
    description: 'Export detailed reports in PDF, CSV, or JSON. Perfect for timesheets and billing.',
  },
  {
    icon: Share2,
    title: 'Team Sharing',
    description: 'Share insights with your team or clients. Control what data is visible.',
  },
  {
    icon: FileText,
    title: 'Custom Reports',
    description: 'Build custom reports with the metrics that matter most to your workflow.',
  },
];

const metrics = [
  { label: 'Focus Time', value: '6h 42m', change: '+12%' },
  { label: 'Productivity Score', value: '87/100', change: '+5%' },
  { label: 'Tasks Completed', value: '23', change: '+8%' },
  { label: 'Distractions Blocked', value: '45', change: '-23%' },
];

const Analytics = () => {
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
                  Analytics
                </motion.span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6">
                  Data-driven{' '}
                  <span className="gradient-text">productivity</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Turn your work data into actionable insights. Beautiful charts, 
                  detailed reports, and AI-powered recommendations to help you improve.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup" className="btn-primary inline-flex items-center group">
                    View Analytics
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/features" className="btn-secondary">
                    All Features
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-8 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-3xl blur-3xl" />
                <div className="relative rounded-2xl border border-border/50 overflow-hidden bg-card/80 backdrop-blur-sm shadow-2xl">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-muted-foreground flex-1 text-center">Activity Timeline</span>
                  </div>
                  <img 
                    src={previewActivity} 
                    alt="Analytics Preview" 
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Live Metrics */}
        <section className="px-6 py-16 border-y border-border/50 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl border border-border/50 bg-card/50"
                >
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <div className="text-3xl font-serif mb-2">{metric.value}</div>
                  <span className={`text-sm ${metric.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change} vs last week
                  </span>
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
                Insights that <span className="gradient-text">matter</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive analytics tools to understand and improve your productivity.
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
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-serif mb-4">
                Start tracking today
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Get beautiful analytics and insights from day one.
              </p>
              <Link to="/signup" className="btn-primary inline-flex items-center group">
                Get Started Free
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

export default Analytics;