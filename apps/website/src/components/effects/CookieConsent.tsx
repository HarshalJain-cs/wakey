import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'wakey-cookie-consent';

// Custom event for reopening the cookie consent
const REOPEN_EVENT = 'wakey-reopen-cookie-consent';

export const reopenCookieConsent = () => {
  window.dispatchEvent(new CustomEvent(REOPEN_EVENT));
};

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleReopen = useCallback(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing the banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    window.addEventListener(REOPEN_EVENT, handleReopen);
    return () => window.removeEventListener(REOPEN_EVENT, handleReopen);
  }, [handleReopen]);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setIsVisible(false);
  };

  const handleClose = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'dismissed');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50"
        >
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xl">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 pr-4">
                <h3 className="font-semibold text-foreground mb-1">We use cookies</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We use cookies to enhance your experience, analyze traffic, and personalize content.{' '}
                  <a href="/privacy" className="text-primary hover:underline">
                    Learn more
                  </a>
                </p>
                <div className="flex items-center gap-3">
                  <Button onClick={handleAccept} size="sm" className="flex-1">
                    Accept All
                  </Button>
                  <Button onClick={handleDecline} variant="outline" size="sm" className="flex-1">
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
