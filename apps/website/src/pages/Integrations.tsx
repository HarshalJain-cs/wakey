import { motion } from 'framer-motion';
import { ArrowRight, Puzzle, Calendar, Slack, Github, Trello, Zap, Globe, Code, Link2, Box, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingElements from '@/components/effects/FloatingElements';

const integrations = [
  { icon: Calendar, name: 'Google Calendar', category: 'Calendar', status: 'Available' },
  { icon: Calendar, name: 'Outlook', category: 'Calendar', status: 'Available' },
  { icon: Slack, name: 'Slack', category: 'Communication', status: 'Available' },
  { icon: Github, name: 'GitHub', category: 'Development', status: 'Available' },
  { icon: Trello, name: 'Trello', category: 'Project Management', status: 'Available' },
  { icon: Box, name: 'Notion', category: 'Productivity', status: 'Available' },
  { icon: Box, name: 'Asana', category: 'Project Management', status: 'Available' },
  { icon: Box, name: 'Jira', category: 'Development', status: 'Available' },
  { icon: Box, name: 'Linear', category: 'Development', status: 'Coming Soon' },
  { icon: Box, name: 'Figma', category: 'Design', status: 'Coming Soon' },
  { icon: Box, name: 'VS Code', category: 'Development', status: 'Available' },
  { icon: Box, name: 'Zoom', category: 'Communication', status: 'Available' },
];

const features = [
  {
    icon: Link2,
    title: 'One-Click Connect',
    description: 'Connect your favorite apps in seconds. No complex setup or API keys needed.',
  },
  {
    icon: Zap,
    title: 'Zapier & Make',
    description: 'Build custom automations with 5000+ apps through Zapier and Make integrations.',
  },
  {
    icon: Code,
    title: 'REST API',
    description: 'Full API access for custom integrations. Build exactly what you need.',
  },
  {
    icon: Database,
    title: 'Webhooks',
    description: 'Real-time webhooks to sync data with your own systems and tools.',
  },
];

const Integrations = () => {
  return (
    <div className="grain min-h-screen">
      <FloatingElements />
      <Navbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-6 py-24 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center">
            <motion.span 
              className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Integrations
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6"
            >
              Connect with your{' '}
              <span className="gradient-text">favorite tools</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Wakey integrates seamlessly with 50+ apps and services. Sync your calendars, 
              import tasks, and automate your workflow.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link to="/signup" className="btn-primary inline-flex items-center group">
                Start Connecting
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/docs" className="btn-secondary">
                API Docs
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Integrations Grid */}
        <section className="px-6 py-16 border-y border-border/50 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {integrations.map((integration, index) => (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <integration.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{integration.name}</h3>
                      <p className="text-xs text-muted-foreground">{integration.category}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    integration.status === 'Available' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {integration.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Developer Features */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-serif mb-4">
                For <span className="gradient-text">developers</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Build custom integrations with our comprehensive API and developer tools.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="premium-card-hover group flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
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
              <Puzzle className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-serif mb-4">
                Ready to connect?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Start syncing your tools and automate your workflow today.
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

export default Integrations;