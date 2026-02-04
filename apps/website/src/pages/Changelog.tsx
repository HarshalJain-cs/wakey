import { motion } from 'framer-motion';
import ScrollSection from '@/components/effects/ScrollSection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';

const changelogEntries = [
  {
    version: '2.4.0',
    date: 'January 28, 2025',
    type: 'major',
    changes: [
      { type: 'feature', text: 'AI-powered task prioritization engine' },
      { type: 'feature', text: 'New Focus Mode with ambient soundscapes' },
      { type: 'improvement', text: 'Dashboard performance improvements (40% faster)' },
      { type: 'fix', text: 'Fixed timezone sync issues in calendar view' },
    ],
  },
  {
    version: '2.3.2',
    date: 'January 15, 2025',
    type: 'patch',
    changes: [
      { type: 'fix', text: 'Resolved notification delays on mobile devices' },
      { type: 'fix', text: 'Fixed dark mode flickering on page load' },
      { type: 'improvement', text: 'Better error messages for failed syncs' },
    ],
  },
  {
    version: '2.3.0',
    date: 'January 5, 2025',
    type: 'minor',
    changes: [
      { type: 'feature', text: 'Team collaboration workspaces' },
      { type: 'feature', text: 'Slack and Discord integrations' },
      { type: 'improvement', text: 'Redesigned analytics charts' },
      { type: 'improvement', text: 'Export data to CSV and PDF' },
    ],
  },
  {
    version: '2.2.0',
    date: 'December 20, 2024',
    type: 'minor',
    changes: [
      { type: 'feature', text: 'Weekly productivity reports via email' },
      { type: 'feature', text: 'Custom keyboard shortcuts' },
      { type: 'improvement', text: 'Faster search across all tasks' },
    ],
  },
  {
    version: '2.1.0',
    date: 'December 1, 2024',
    type: 'minor',
    changes: [
      { type: 'feature', text: 'Google Calendar two-way sync' },
      { type: 'feature', text: 'Pomodoro timer with statistics' },
      { type: 'fix', text: 'Fixed recurring task duplication bug' },
    ],
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature':
      return 'bg-primary/10 text-primary';
    case 'improvement':
      return 'bg-accent/50 text-accent-foreground';
    case 'fix':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const Changelog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollSection>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Product Updates</Badge>
              <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
                Changelog
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what's new in Wakey. We ship updates weekly to help you stay productive.
              </p>
            </div>
          </ScrollSection>

          <div className="space-y-12">
            {changelogEntries.map((entry, index) => (
              <ScrollSection key={entry.version}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-8 border-l-2 border-border"
                >
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />
                  
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h2 className="text-2xl font-semibold text-foreground">
                      v{entry.version}
                    </h2>
                    <Badge variant={entry.type === 'major' ? 'default' : 'secondary'}>
                      {entry.type}
                    </Badge>
                    <span className="text-muted-foreground text-sm">{entry.date}</span>
                  </div>

                  <ul className="space-y-3">
                    {entry.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Badge className={`${getTypeColor(change.type)} text-xs`}>
                          {change.type}
                        </Badge>
                        <span className="text-foreground">{change.text}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </ScrollSection>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Changelog;
