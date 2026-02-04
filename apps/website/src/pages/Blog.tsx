import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollSection from '@/components/effects/ScrollSection';
import SEO from '@/components/SEO';

import blogDeepWork from '@/assets/blog-deep-work.jpg';
import blogProductivityHacks from '@/assets/blog-productivity-hacks.jpg';
import blogAiInsights from '@/assets/blog-ai-insights.jpg';
import blogMorningRoutine from '@/assets/blog-morning-routine.jpg';

const posts = [
  { id: 1, title: 'The Science of Deep Work', excerpt: 'Learn the neuroscience behind deep focus.', category: 'Focus', date: 'Jan 20, 2026', readTime: '8 min', image: blogDeepWork },
  { id: 2, title: '10 Productivity Hacks', excerpt: 'Evidence-based techniques that work.', category: 'Tips', date: 'Jan 18, 2026', readTime: '6 min', image: blogProductivityHacks },
  { id: 3, title: 'Introducing AI Insights', excerpt: 'Our new AI-powered feature.', category: 'Updates', date: 'Jan 15, 2026', readTime: '4 min', image: blogAiInsights },
  { id: 4, title: 'Building a Morning Routine', excerpt: 'Design your ideal morning.', category: 'Tips', date: 'Jan 12, 2026', readTime: '7 min', image: blogMorningRoutine },
];

const Blog = () => {
  return (
    <div className="grain">
      <SEO 
        title="Blog" 
        description="Insights, tips, and updates from the Wakey team to help you work smarter and boost your productivity."
      />
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollSection fadeIn fadeOut parallax className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-serif mb-6">The Wakey <span className="gradient-text">Blog</span></h1>
            <p className="text-xl text-muted-foreground">Insights to help you work smarter.</p>
          </ScrollSection>

          <ScrollSection fadeIn fadeOut parallax>
            <div className="grid sm:grid-cols-2 gap-6">
              {posts.map((post, index) => (
                <motion.div 
                  key={post.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/blog/${post.id}`} className="block premium-card-hover h-full group">
                    <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <span className="text-primary text-xs font-medium">{post.category}</span>
                    <h3 className="font-serif text-lg mt-2 mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </ScrollSection>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
