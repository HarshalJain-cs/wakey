import { useState } from 'react';
import { Share2, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/components/effects/SoundEffects';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  title: string;
  url?: string;
}

const SocialShare = ({ title, url }: SocialShareProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { playClick } = useSound();
  const { toast } = useToast();

  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'hover:text-[#1DA1F2]'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:text-[#0A66C2]'
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'The article link has been copied to your clipboard.'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted hover:border-primary/30 transition-all text-sm group"
      >
        <Share2 className="w-4 h-4 group-hover:text-primary transition-colors" />
        Share
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 z-50 min-w-[180px] rounded-lg border border-border bg-card shadow-lg overflow-hidden"
            >
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    playClick();
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors ${link.color}`}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="text-sm">Share on {link.name}</span>
                </a>
              ))}
              
              <button
                onClick={() => {
                  playClick();
                  copyToClipboard();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors w-full text-left border-t border-border"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                <span className="text-sm">{copied ? 'Copied!' : 'Copy link'}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialShare;
