import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Monitor, Apple, Chrome, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSound } from '@/components/effects/SoundEffects';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';

type Platform = 'windows' | 'mac' | 'linux';

const DownloadPage = () => {
  const [platform, setPlatform] = useState<Platform>('windows');
  const { user, isPremium, premiumStatus } = useAuth();
  const { playClick } = useSound();

  // Detect user's platform
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) {
      setPlatform('windows');
    } else if (userAgent.includes('mac')) {
      setPlatform('mac');
    } else if (userAgent.includes('linux')) {
      setPlatform('linux');
    }
  }, []);

  // GitHub releases base URL - update this when you create a release
  const GITHUB_RELEASE_URL = 'https://github.com/HarshalJain-cs/wakey/releases/download/v0.1.0';

  const downloads: Record<Platform, { label: string; icon: typeof Monitor; file: string; size: string; url: string; portable?: { file: string; size: string; url: string } }> = {
    windows: {
      label: 'Windows',
      icon: Monitor,
      file: 'Wakey-0.1.0-x64.exe',
      size: '104 MB',
      url: `${GITHUB_RELEASE_URL}/Wakey-0.1.0-x64.exe`,
      portable: {
        file: 'Wakey-0.1.0-Portable.exe',
        size: '104 MB',
        url: `${GITHUB_RELEASE_URL}/Wakey-0.1.0-Portable.exe`,
      },
    },
    mac: {
      label: 'macOS',
      icon: Apple,
      file: 'Wakey-0.1.0.dmg',
      size: 'Coming Soon',
      url: '#',
    },
    linux: {
      label: 'Linux',
      icon: Monitor,
      file: 'Wakey-0.1.0.AppImage',
      size: 'Coming Soon',
      url: '#',
    },
  };

  const currentDownload = downloads[platform];
  const PlatformIcon = currentDownload.icon;

  const features = [
    'Automatic time tracking',
    'Smart break reminders',
    'Focus mode sessions',
    'Productivity analytics',
    'Browser extension sync',
    isPremium ? 'AI-powered insights' : 'AI insights (Premium)',
  ];

  return (
    <div className="grain min-h-screen">
      <SEO
        title="Download Wakey"
        description="Download Wakey for Windows, macOS, or Linux. Also available as a Chrome extension."
      />
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6">
              Download <span className="gradient-text">Wakey</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with Wakey on your desktop and browser. Track your productivity across all your devices.
            </p>

            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Signed in as {user.email}
                  {isPremium && ' (Premium)'}
                  {premiumStatus.tier === 'trial' && ' (Trial)'}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Desktop App Download */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-card mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
                    <PlatformIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif">Desktop App</h2>
                    <p className="text-sm text-muted-foreground">
                      for {currentDownload.label}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Platform tabs */}
                <div className="flex gap-2 mb-6">
                  {(Object.keys(downloads) as Platform[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        playClick();
                        setPlatform(p);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        platform === p
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {downloads[p].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                {currentDownload.url !== '#' ? (
                  <>
                    <motion.a
                      href={currentDownload.url}
                      onClick={playClick}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary flex items-center gap-3 px-8 py-4 text-lg"
                    >
                      <Download className="w-5 h-5" />
                      Download for {currentDownload.label}
                    </motion.a>
                    <span className="text-xs text-muted-foreground">{currentDownload.size}</span>
                    {currentDownload.portable && (
                      <a
                        href={currentDownload.portable.url}
                        onClick={playClick}
                        className="text-xs text-primary hover:underline"
                      >
                        Or download portable version ({currentDownload.portable.size})
                      </a>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <button
                      disabled
                      className="btn-primary opacity-50 cursor-not-allowed flex items-center gap-3 px-8 py-4 text-lg"
                    >
                      <Download className="w-5 h-5" />
                      Coming Soon
                    </button>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {currentDownload.label} version is under development
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Browser Extension */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
                    <Chrome className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif">Browser Extension</h2>
                    <p className="text-sm text-muted-foreground">
                      Chrome, Edge, Brave
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">
                  Track your browsing activity and get distraction alerts right in your browser.
                  Syncs automatically with the desktop app.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Website time tracking
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Distraction alerts
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Focus mode integration
                  </li>
                </ul>
              </div>

              <div className="flex flex-col items-center gap-4">
                <motion.a
                  href="https://chrome.google.com/webstore/detail/wakey"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary flex items-center gap-3 px-8 py-4"
                >
                  <Chrome className="w-5 h-5" />
                  Add to Chrome
                </motion.a>
                <span className="text-xs text-muted-foreground">Free</span>
              </div>
            </div>
          </motion.div>

          {/* Upgrade CTA for free users */}
          {user && !isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="premium-card border-primary/30 bg-primary/5"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-serif">Upgrade to Pro</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Unlock AI-powered insights, unlimited tracking, and advanced analytics.
                  </p>
                </div>
                <Link
                  to="/pricing"
                  onClick={playClick}
                  className="btn-primary flex items-center gap-2"
                >
                  View Plans
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Getting Started */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-serif text-center mb-8">Getting Started</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: 'Download & Install',
                  description: 'Download the desktop app for your platform and run the installer.',
                },
                {
                  step: '2',
                  title: 'Sign In',
                  description: 'Open Wakey and sign in with your account to sync your data.',
                },
                {
                  step: '3',
                  title: 'Start Tracking',
                  description: 'Wakey runs in the background and automatically tracks your activity.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DownloadPage;
