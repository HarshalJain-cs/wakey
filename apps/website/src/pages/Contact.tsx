import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, Loader2, Check } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSound } from '@/components/effects/SoundEffects';
import ScrollSection from '@/components/effects/ScrollSection';
import SEO from '@/components/SEO';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const { playClick, playSuccess } = useSound();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setStatus('loading');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStatus('success');
    playSuccess();
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="grain">
      <SEO 
        title="Contact" 
        description="Get in touch with the Wakey team. We'd love to hear from you about feedback, partnerships, or any questions."
      />
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollSection fadeIn fadeOut parallax className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-serif mb-6">Get in <span className="gradient-text">touch</span></h1>
            <p className="text-xl text-muted-foreground">We'd love to hear from you.</p>
          </ScrollSection>

          <ScrollSection fadeIn fadeOut parallax>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="premium-card flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)' }}>
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div><h3 className="font-medium">Email</h3><p className="text-sm text-muted-foreground">hello@wakey.app</p></div>
                </div>
                <div className="premium-card flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)' }}>
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div><h3 className="font-medium">Office</h3><p className="text-sm text-muted-foreground">Bangalore, India</p></div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="premium-card">
                  {status === 'success' ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-primary" /></div>
                      <h3 className="text-xl font-serif mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">We'll get back to you soon.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium mb-2">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none" required /></div>
                        <div><label className="block text-sm font-medium mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none" required /></div>
                      </div>
                      <div><label className="block text-sm font-medium mb-2">Message</label><textarea rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none resize-none" required /></div>
                      <button type="submit" disabled={status === 'loading'} className="btn-primary inline-flex items-center gap-2">{status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />Send Message</>}</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </ScrollSection>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
