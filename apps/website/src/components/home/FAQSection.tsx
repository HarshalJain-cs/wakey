import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ScrollSection from '@/components/effects/ScrollSection';

const faqs = [
  {
    question: 'How does Wakey track my productivity?',
    answer: 'Wakey uses intelligent time tracking that runs in the background. It automatically detects when you\'re in focus mode, tracks time spent on different tasks, and uses AI to categorize your work patterns—all while respecting your privacy.'
  },
  {
    question: 'Is my data private and secure?',
    answer: 'Absolutely. Your data is encrypted end-to-end and stored securely. By default, AI Insights processes data locally on your device. We never sell your data, and you have complete control over what\'s synced to the cloud.'
  },
  {
    question: 'Can I try Wakey before committing?',
    answer: 'Yes! We offer a 14-day free trial with full access to all features, including AI Insights. No credit card required. If you love it, upgrade to Pro for just $4/week.'
  },
  {
    question: 'What integrations does Wakey support?',
    answer: 'Wakey integrates with 50+ tools including Slack, Notion, Trello, Asana, Google Calendar, Todoist, and more. We also support Zapier and Make for custom automations.'
  },
  {
    question: 'How is Wakey different from other productivity apps?',
    answer: 'Unlike traditional time trackers, Wakey combines AI-powered insights with distraction blocking and goal setting in one beautiful app. Our focus mode actually blocks distractions, and our AI learns your unique patterns to give personalized recommendations.'
  },
  {
    question: 'Can I use Wakey on multiple devices?',
    answer: 'Yes! Wakey syncs seamlessly across desktop (Mac, Windows, Linux), mobile (iOS, Android), and web. Your data and settings follow you everywhere.'
  },
  {
    question: 'What happens when I cancel my subscription?',
    answer: 'You keep access until the end of your billing period. After that, your data remains safe and you can export it anytime. You can resubscribe whenever you want—your history and settings will be waiting for you.'
  },
  {
    question: 'Do you offer team or enterprise plans?',
    answer: 'Yes! Our Team plan starts at $8/user/week and includes shared analytics, team goals, and admin controls. For enterprises, we offer custom pricing with SSO, advanced security, and dedicated support.'
  }
];

const FAQSection = () => {
  return (
    <ScrollSection className="px-6 py-24" fadeIn fadeOut parallax>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif mt-4 mb-4">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Wakey. Can't find the answer? Reach out to our support team.
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ 
                delay: index * 0.08,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <AccordionItem 
                value={`item-${index}`}
                className="premium-card premium-card-hover border-border/50 px-6 data-[state=open]:border-primary/30 transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </ScrollSection>
  );
};

export default FAQSection;
