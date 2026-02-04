import { motion } from 'framer-motion';
import { Info, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import type { DocSection } from '@/data/docsContent';

interface DocArticleRendererProps {
  content: DocSection[];
}

const CalloutIcon = ({ variant }: { variant: 'info' | 'warning' | 'tip' }) => {
  switch (variant) {
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'tip':
      return <Lightbulb className="w-5 h-5 text-secondary" />;
    default:
      return <Info className="w-5 h-5 text-primary" />;
  }
};

const calloutStyles = {
  info: 'bg-primary/10 border-primary/30',
  warning: 'bg-yellow-500/10 border-yellow-500/30',
  tip: 'bg-secondary/10 border-secondary/30',
};

const DocArticleRenderer = ({ content }: DocArticleRendererProps) => {
  return (
    <div className="prose prose-invert max-w-none">
      {content.map((section, index) => {
        const delay = index * 0.03;

        switch (section.type) {
          case 'heading':
            return (
              <motion.h2
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                className="text-xl font-serif text-foreground mt-8 mb-4 first:mt-0"
              >
                {section.content}
              </motion.h2>
            );

          case 'paragraph':
            return (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                className="text-muted-foreground leading-relaxed mb-4"
              >
                {section.content}
              </motion.p>
            );

          case 'list':
            return (
              <motion.ul
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                className="space-y-2 mb-4"
              >
                {section.items?.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <ChevronRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </motion.ul>
            );

          case 'steps':
            return (
              <motion.ol
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                className="space-y-3 mb-4"
              >
                {section.items?.map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-muted-foreground">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </motion.ol>
            );

          case 'callout':
            const variant = section.variant || 'info';
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                className={`flex items-start gap-3 p-4 rounded-lg border mb-4 ${calloutStyles[variant]}`}
              >
                <CalloutIcon variant={variant} />
                <p className="text-sm text-foreground">{section.content}</p>
              </motion.div>
            );

          case 'code':
            return (
              <motion.pre
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto mb-4"
              >
                <code className="text-sm text-foreground font-mono">
                  {section.content}
                </code>
              </motion.pre>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default DocArticleRenderer;
