import { motion } from 'framer-motion';
import ScrollSection from '@/components/effects/ScrollSection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Code, Key, Zap, Book, Terminal, Lock } from 'lucide-react';

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/tasks',
    description: 'List all tasks for the authenticated user',
  },
  {
    method: 'POST',
    path: '/api/v1/tasks',
    description: 'Create a new task',
  },
  {
    method: 'GET',
    path: '/api/v1/analytics',
    description: 'Retrieve productivity analytics and insights',
  },
  {
    method: 'GET',
    path: '/api/v1/focus-sessions',
    description: 'List focus session history',
  },
  {
    method: 'POST',
    path: '/api/v1/webhooks',
    description: 'Configure webhook endpoints for real-time events',
  },
];

const features = [
  {
    icon: Zap,
    title: 'RESTful API',
    description: 'Clean, intuitive endpoints following REST conventions',
  },
  {
    icon: Lock,
    title: 'OAuth 2.0',
    description: 'Secure authentication with industry-standard protocols',
  },
  {
    icon: Terminal,
    title: 'Webhooks',
    description: 'Real-time notifications for task and session events',
  },
  {
    icon: Book,
    title: 'SDKs',
    description: 'Official libraries for JavaScript, Python, and Go',
  },
];

const API = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollSection>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Developer Resources</Badge>
              <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
                Wakey API
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Build powerful integrations with our comprehensive REST API.
              </p>
            </div>
          </ScrollSection>

          {/* Features */}
          <ScrollSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-card border border-border rounded-2xl"
                >
                  <div className="w-12 h-12 mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </ScrollSection>

          {/* Getting Started */}
          <ScrollSection>
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Key className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Getting Started</h2>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Authenticate your requests using an API key. Include it in the Authorization header:
                </p>
                <div className="bg-background border border-border rounded-xl p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-foreground">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
                <p className="text-muted-foreground">
                  You can generate API keys from your account settings. Rate limits apply based on your plan.
                </p>
              </div>
            </div>
          </ScrollSection>

          {/* Endpoints */}
          <ScrollSection>
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">API Endpoints</h2>
              </div>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <motion.div
                    key={endpoint.path}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-background border border-border/50 rounded-xl"
                  >
                    <Badge 
                      className={`shrink-0 w-fit ${
                        endpoint.method === 'GET' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="font-mono text-sm text-foreground">{endpoint.path}</code>
                    <span className="text-sm text-muted-foreground sm:ml-auto">{endpoint.description}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollSection>

          <ScrollSection>
            <div className="mt-16 text-center p-8 bg-card border border-border rounded-2xl">
              <h3 className="text-xl font-semibold text-foreground mb-2">Ready to build?</h3>
              <p className="text-muted-foreground mb-4">
                Explore our full documentation with code examples and guides.
              </p>
              <a href="/docs" className="btn-primary inline-block">
                View Full Docs
              </a>
            </div>
          </ScrollSection>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default API;
