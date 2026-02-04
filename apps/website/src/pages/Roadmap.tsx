import { motion } from 'framer-motion';
import ScrollSection from '@/components/effects/ScrollSection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock } from 'lucide-react';

const roadmapItems = [
  {
    quarter: 'Q1 2025',
    status: 'in-progress',
    items: [
      { name: 'Mobile app for iOS and Android', status: 'in-progress', description: 'Native apps with offline support and push notifications' },
      { name: 'AI meeting summarizer', status: 'planned', description: 'Automatically summarize and extract action items from meetings' },
      { name: 'Advanced reporting dashboard', status: 'completed', description: 'Custom reports with export capabilities' },
    ],
  },
  {
    quarter: 'Q2 2025',
    status: 'planned',
    items: [
      { name: 'Team workspaces', status: 'planned', description: 'Collaborative spaces for team productivity tracking' },
      { name: 'Notion integration', status: 'planned', description: 'Two-way sync with Notion databases' },
      { name: 'Goal tracking system', status: 'planned', description: 'Set and track long-term goals with milestones' },
    ],
  },
  {
    quarter: 'Q3 2025',
    status: 'planned',
    items: [
      { name: 'Voice commands', status: 'planned', description: 'Control Wakey hands-free with voice' },
      { name: 'Smart scheduling AI', status: 'planned', description: 'AI suggests optimal times for tasks based on your patterns' },
      { name: 'Browser extension', status: 'planned', description: 'Quick capture and time tracking from any website' },
    ],
  },
  {
    quarter: 'Q4 2025',
    status: 'planned',
    items: [
      { name: 'Enterprise features', status: 'planned', description: 'SSO, audit logs, and admin controls' },
      { name: 'API v2', status: 'planned', description: 'Expanded API with webhooks and real-time events' },
      { name: 'Custom integrations builder', status: 'planned', description: 'Create your own integrations without code' },
    ],
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-primary" />;
    case 'in-progress':
      return <Clock className="w-5 h-5 text-amber-500" />;
    default:
      return <Circle className="w-5 h-5 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-primary/10 text-primary">Completed</Badge>;
    case 'in-progress':
      return <Badge className="bg-amber-500/10 text-amber-600">In Progress</Badge>;
    default:
      return <Badge variant="secondary">Planned</Badge>;
  }
};

const Roadmap = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollSection>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">What's Next</Badge>
              <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
                Product Roadmap
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what we're building next. Your feedback shapes our priorities.
              </p>
            </div>
          </ScrollSection>

          <div className="grid gap-8">
            {roadmapItems.map((quarter, qIndex) => (
              <ScrollSection key={quarter.quarter}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: qIndex * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-semibold text-foreground">{quarter.quarter}</h2>
                    {getStatusBadge(quarter.status)}
                  </div>

                  <div className="grid gap-4">
                    {quarter.items.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/50"
                      >
                        {getStatusIcon(item.status)}
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </ScrollSection>
            ))}
          </div>

          <ScrollSection>
            <div className="mt-16 text-center p-8 bg-card border border-border rounded-2xl">
              <h3 className="text-xl font-semibold text-foreground mb-2">Have a feature request?</h3>
              <p className="text-muted-foreground mb-4">
                We'd love to hear your ideas. Your feedback directly influences our roadmap.
              </p>
              <a href="/contact" className="btn-primary inline-block">
                Submit Feedback
              </a>
            </div>
          </ScrollSection>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Roadmap;
