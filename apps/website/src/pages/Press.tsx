import { motion } from 'framer-motion';
import ScrollSection from '@/components/effects/ScrollSection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Mail, Calendar, FileText, Palette, Image, ExternalLink } from 'lucide-react';
import SEO from '@/components/SEO';

const brandAssets = [
  {
    name: 'Primary Logo',
    description: 'Full color logo for light and dark backgrounds',
    files: [
      { format: 'SVG', path: '/brand/wakey-logo-primary.svg' },
      { format: 'PNG', path: '/brand/wakey-logo-primary.png' },
    ],
    preview: (
      <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)' }}>
        <span className="text-3xl font-serif text-white">W</span>
      </div>
    ),
  },
  {
    name: 'Logo Mark',
    description: 'Icon-only version for small spaces',
    files: [
      { format: 'SVG', path: '/brand/wakey-logo-mark.svg' },
      { format: 'PNG', path: '/brand/wakey-logo-mark.png' },
    ],
    preview: (
      <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-primary">
        <span className="text-2xl font-serif text-primary-foreground">W</span>
      </div>
    ),
  },
  {
    name: 'Wordmark',
    description: 'Text-only logo version',
    files: [
      { format: 'SVG (Dark)', path: '/brand/wakey-wordmark.svg' },
      { format: 'SVG (Light)', path: '/brand/wakey-wordmark-light.svg' },
    ],
    preview: (
      <span className="text-3xl font-serif text-foreground">Wakey</span>
    ),
  },
];

const brandColors = [
  { name: 'Electric Blue', hex: '#3B82F6', hsl: 'hsl(217, 91%, 60%)' },
  { name: 'Golden Accent', hex: '#EAB308', hsl: 'hsl(45, 93%, 58%)' },
  { name: 'Premium Black', hex: '#0A0A0F', hsl: 'hsl(240, 20%, 4%)' },
  { name: 'Pure White', hex: '#FFFFFF', hsl: 'hsl(0, 0%, 100%)' },
];

const pressReleases = [
  {
    date: 'January 15, 2026',
    title: 'Wakey Reaches 10,000 Active Users Milestone',
    excerpt: 'Productivity app celebrates rapid growth with new AI-powered features and expanded team.',
  },
  {
    date: 'January 5, 2026',
    title: 'Wakey Launches Beta with AI-Powered Insights',
    excerpt: 'New productivity platform combines time tracking with intelligent recommendations.',
  },
  {
    date: 'November 20, 2025',
    title: 'Wakey Founded to Revolutionize Personal Productivity',
    excerpt: 'Founder Harshal Jain announces mission to help people focus on what matters.',
  },
];

const companyFacts = [
  { label: 'Founded', value: 'November 2025' },
  { label: 'Headquarters', value: 'Bangalore, India' },
  { label: 'Active Users', value: '10,000+' },
  { label: 'Tasks Completed', value: '2M+' },
  { label: 'Hours Saved', value: '50,000+' },
  { label: 'App Rating', value: '4.9/5' },
];

const Press = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Press & Media Kit" 
        description="Download Wakey brand assets, read press releases, and get media inquiries. Everything you need to write about Wakey."
      />
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollSection>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">For Media</Badge>
              <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
                Press & Media Kit
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to write about Wakey. Download brand assets, read press releases, and get in touch.
              </p>
            </div>
          </ScrollSection>

          {/* Media Contact */}
          <ScrollSection>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Media Inquiries</h2>
                  <p className="text-muted-foreground">For press inquiries, interviews, and partnership opportunities</p>
                </div>
                <a href="mailto:press@wakey.app" className="btn-primary inline-flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  press@wakey.app
                </a>
              </div>
            </div>
          </ScrollSection>

          {/* Company Facts */}
          <ScrollSection>
            <h2 className="text-2xl font-serif text-foreground mb-6">Company Facts</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {companyFacts.map((fact, index) => (
                <motion.div
                  key={fact.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="text-center p-4 bg-card border border-border rounded-xl"
                >
                  <div className="text-lg font-semibold text-foreground">{fact.value}</div>
                  <div className="text-xs text-muted-foreground">{fact.label}</div>
                </motion.div>
              ))}
            </div>
          </ScrollSection>

          {/* Brand Assets */}
          <ScrollSection>
            <div className="flex items-center gap-3 mb-6">
              <Image className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif text-foreground">Brand Assets</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {brandAssets.map((asset, index) => (
                <motion.div
                  key={asset.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="h-24 flex items-center justify-center mb-4 bg-background rounded-xl">
                    {asset.preview}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{asset.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{asset.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {asset.files.map((file) => (
                      <Button 
                        key={file.format} 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        asChild
                      >
                        <a href={file.path} download>
                          <Download className="w-3 h-3 mr-1" />
                          {file.format}
                        </a>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollSection>

          {/* Brand Colors */}
          <ScrollSection>
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif text-foreground">Brand Colors</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {brandColors.map((color, index) => (
                <motion.div
                  key={color.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <div 
                    className="h-20" 
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="p-4">
                    <h4 className="font-medium text-foreground">{color.name}</h4>
                    <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollSection>

          {/* Press Releases */}
          <ScrollSection>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif text-foreground">Press Releases</h2>
            </div>
            <div className="space-y-4 mb-12">
              {pressReleases.map((release, index) => (
                <motion.div
                  key={release.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        {release.date}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {release.title}
                      </h3>
                      <p className="text-muted-foreground">{release.excerpt}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollSection>

          {/* Brand Guidelines */}
          <ScrollSection>
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Brand Guidelines</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-1">Logo Usage</h3>
                  <p className="text-sm">
                    Please maintain clear space around the logo equal to the height of the "W" mark. 
                    Do not stretch, rotate, or alter the logo colors.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Typography</h3>
                  <p className="text-sm">
                    Wakey uses a serif typeface for headlines and brand elements, paired with a clean sans-serif for body text.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Tone of Voice</h3>
                  <p className="text-sm">
                    Our communication is friendly, focused, and empowering. We speak directly to users about productivity without being preachy.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Download Full Brand Guidelines (PDF)
                </Button>
              </div>
            </div>
          </ScrollSection>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Press;
