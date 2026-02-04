import { motion } from 'framer-motion';
import ScrollSection from '@/components/effects/ScrollSection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Briefcase, Heart, Zap, Users, Globe } from 'lucide-react';

const openPositions = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    description: 'Build beautiful, performant interfaces that help millions stay productive.',
  },
  {
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    description: 'Scale our infrastructure to handle growing demand and new features.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    description: 'Shape the future of productivity tools with thoughtful, user-centered design.',
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    description: 'Ensure reliability and performance of our cloud infrastructure.',
  },
  {
    title: 'Content Marketing Manager',
    department: 'Marketing',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Create compelling content that educates and inspires our community.',
  },
];

const benefits = [
  { icon: Globe, title: 'Remote-first', description: 'Work from anywhere in the world' },
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health coverage' },
  { icon: Zap, title: 'Learning Budget', description: '$2,000/year for growth' },
  { icon: Users, title: 'Team Retreats', description: 'Annual in-person gatherings' },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollSection>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Join Our Team</Badge>
              <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
                Build the Future of Productivity
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join a passionate team dedicated to helping people do their best work.
              </p>
            </div>
          </ScrollSection>

          {/* Benefits */}
          <ScrollSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-card border border-border rounded-2xl"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </ScrollSection>

          {/* Open Positions */}
          <ScrollSection>
            <h2 className="text-2xl font-serif text-foreground mb-8">Open Positions</h2>
            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <motion.div
                  key={position.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {position.title}
                      </h3>
                      <p className="text-muted-foreground mt-1">{position.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Badge className="shrink-0">Apply Now</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollSection>

          <ScrollSection>
            <div className="mt-16 text-center p-8 bg-card border border-border rounded-2xl">
              <h3 className="text-xl font-semibold text-foreground mb-2">Don't see a role that fits?</h3>
              <p className="text-muted-foreground mb-4">
                We're always looking for talented people. Send us your resume and let's chat.
              </p>
              <a href="/contact" className="btn-primary inline-block">
                Get in Touch
              </a>
            </div>
          </ScrollSection>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Careers;
