import { motion } from 'framer-motion';
import ScrollSection from '@/components/effects/ScrollSection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Calendar, Award, ExternalLink } from 'lucide-react';

const communityChannels = [
  {
    name: 'Discord',
    description: 'Join 5,000+ members for real-time discussions, support, and productivity tips.',
    members: '5,200+',
    link: '#',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
  },
  {
    name: 'Forum',
    description: 'Deep-dive discussions on productivity methodologies and Wakey best practices.',
    members: '2,800+',
    link: '#',
    icon: <MessageCircle className="w-6 h-6" />,
  },
  {
    name: 'Twitter/X',
    description: 'Follow for updates, tips, and connect with the team.',
    members: '12,000+',
    link: 'https://x.com/harryyy_cs',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

const events = [
  {
    title: 'Productivity Masterclass',
    date: 'Feb 15, 2025',
    type: 'Webinar',
    description: 'Learn advanced time-blocking techniques from productivity experts.',
  },
  {
    title: 'Community AMA',
    date: 'Feb 22, 2025',
    type: 'Live Q&A',
    description: 'Ask the Wakey team anything about upcoming features and roadmap.',
  },
  {
    title: 'Focus Challenge',
    date: 'Mar 1-7, 2025',
    type: 'Challenge',
    description: '7-day community challenge to build better focus habits.',
  },
];

const topContributors = [
  { name: 'Sarah Chen', contributions: 156, badge: 'Productivity Guru' },
  { name: 'Marcus Johnson', contributions: 134, badge: 'Community Champion' },
  { name: 'Elena Rodriguez', contributions: 98, badge: 'Helpful Hero' },
  { name: 'David Kim', contributions: 87, badge: 'Rising Star' },
];

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollSection>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Join the Movement</Badge>
              <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
                Wakey Community
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with thousands of productivity enthusiasts. Learn, share, and grow together.
              </p>
            </div>
          </ScrollSection>

          {/* Community Channels */}
          <ScrollSection>
            <h2 className="text-2xl font-serif text-foreground mb-6">Join the Conversation</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {communityChannels.map((channel, index) => (
                <motion.a
                  key={channel.name}
                  href={channel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {channel.icon}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{channel.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{channel.description}</p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Users className="w-4 h-4" />
                    {channel.members} members
                  </div>
                </motion.a>
              ))}
            </div>
          </ScrollSection>

          {/* Upcoming Events */}
          <ScrollSection>
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Upcoming Events</h2>
              </div>
              <div className="space-y-4">
                {events.map((event, index) => (
                  <motion.div
                    key={event.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-background border border-border/50 rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{event.title}</h3>
                        <Badge variant="secondary" className="text-xs">{event.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <div className="text-sm font-medium text-primary shrink-0">{event.date}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollSection>

          {/* Top Contributors */}
          <ScrollSection>
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Top Contributors</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {topContributors.map((contributor, index) => (
                  <motion.div
                    key={contributor.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-background border border-border/50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{contributor.name}</h4>
                      <p className="text-xs text-muted-foreground">{contributor.badge}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {contributor.contributions} contributions
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollSection>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
