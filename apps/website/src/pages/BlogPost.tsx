import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Bookmark } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSound } from '@/components/effects/SoundEffects';
import SocialShare from '@/components/blog/SocialShare';
import RelatedPosts from '@/components/blog/RelatedPosts';
import SEO from '@/components/SEO';

import blogDeepWork from '@/assets/blog-deep-work.jpg';
import blogProductivityHacks from '@/assets/blog-productivity-hacks.jpg';
import blogAiInsights from '@/assets/blog-ai-insights.jpg';
import blogMorningRoutine from '@/assets/blog-morning-routine.jpg';

const blogPosts = {
  '1': {
    title: 'The Science of Deep Work',
    excerpt: 'Learn the neuroscience behind deep focus.',
    category: 'Focus',
    date: 'Jan 20, 2026',
    readTime: '8 min',
    image: blogDeepWork,
    author: 'Harshal Jain',
    content: [
      {
        type: 'paragraph',
        text: "In our hyperconnected world, the ability to focus deeply on cognitively demanding tasks is becoming increasingly rare—and increasingly valuable. Cal Newport's concept of 'deep work' has revolutionized how we think about productivity, but what does the science actually say about our brain's capacity for sustained attention?"
      },
      {
        type: 'heading',
        text: 'The Neuroscience of Focus'
      },
      {
        type: 'paragraph',
        text: "When we engage in deep work, our prefrontal cortex—the brain's command center for executive functions—enters a state of heightened activity. This region is responsible for complex thinking, decision-making, and maintaining attention on a single task. Research from MIT has shown that during periods of intense focus, the prefrontal cortex communicates more efficiently with other brain regions, creating what neuroscientists call 'functional connectivity.'"
      },
      {
        type: 'paragraph',
        text: "But here's the fascinating part: this state of deep focus isn't just about the prefrontal cortex working harder. It's about the brain learning to filter out distractions. The anterior cingulate cortex (ACC) acts as a conflict monitor, helping us stay on task by suppressing irrelevant stimuli and competing thoughts."
      },
      {
        type: 'heading',
        text: 'The 90-Minute Focus Cycle'
      },
      {
        type: 'paragraph',
        text: "Our brains operate in natural cycles called ultradian rhythms. Research by sleep scientist Nathaniel Kleitman discovered that we function in 90-minute cycles throughout the day—not just during sleep. This means our capacity for deep work follows a predictable pattern: roughly 90 minutes of high-focus work followed by a 20-minute recovery period."
      },
      {
        type: 'paragraph',
        text: "Wakey's focus timer is built around this science. Our AI analyzes your work patterns and suggests optimal focus session lengths tailored to your personal rhythm. Some users find their peak at 75 minutes, others at 110 minutes—the key is discovering your unique pattern."
      },
      {
        type: 'heading',
        text: 'Building Your Deep Work Practice'
      },
      {
        type: 'paragraph',
        text: "The good news? Deep work is a skill that can be trained. Neuroscientist Adam Gazzaley's research demonstrates that attention training can physically change the brain's structure. Through consistent practice, you can strengthen the neural pathways associated with sustained focus."
      },
      {
        type: 'list',
        items: [
          'Start with shorter focus sessions (25-45 minutes) and gradually increase duration',
          'Eliminate environmental distractions before beginning',
          'Practice at the same time each day to build a habit',
          'Use transition rituals to signal the start and end of deep work',
          'Track your sessions to identify patterns and improvements'
        ]
      },
      {
        type: 'paragraph',
        text: "Deep work isn't about grinding harder—it's about working smarter by aligning with your brain's natural capabilities. Start your deep work journey today with Wakey, and discover what focused productivity truly feels like."
      }
    ]
  },
  '2': {
    title: '10 Productivity Hacks That Actually Work',
    excerpt: 'Evidence-based techniques that work.',
    category: 'Tips',
    date: 'Jan 18, 2026',
    readTime: '6 min',
    image: blogProductivityHacks,
    author: 'Harshal Jain',
    content: [
      {
        type: 'paragraph',
        text: "The internet is flooded with productivity advice, but how do you separate the genuinely helpful from the gimmicks? We've compiled 10 techniques backed by scientific research that have been proven to boost productivity. These aren't just theories—they're strategies used by high performers worldwide."
      },
      {
        type: 'heading',
        text: '1. The Two-Minute Rule'
      },
      {
        type: 'paragraph',
        text: "If a task takes less than two minutes to complete, do it immediately. This concept, popularized by David Allen's Getting Things Done methodology, prevents small tasks from accumulating into an overwhelming backlog. Research shows that completing quick tasks provides micro-doses of dopamine, keeping motivation high throughout the day."
      },
      {
        type: 'heading',
        text: '2. Time Blocking'
      },
      {
        type: 'paragraph',
        text: "Instead of working from a to-do list, assign specific time blocks to specific tasks. Studies from Cal Newport and others show that time blocking can increase productivity by up to 50%. When you know exactly what you should be working on at any given moment, decision fatigue decreases dramatically."
      },
      {
        type: 'heading',
        text: '3. The Pomodoro Technique 2.0'
      },
      {
        type: 'paragraph',
        text: "The classic 25-minute work, 5-minute break cycle is a great starting point, but modern research suggests personalizing your intervals. Wakey's AI learns your optimal focus duration and adjusts recommendations accordingly—some people thrive with 50-minute blocks, others with 20."
      },
      {
        type: 'heading',
        text: '4. Environment Design'
      },
      {
        type: 'paragraph',
        text: "Your physical environment profoundly impacts productivity. Research from Princeton found that visual clutter competes for attention and reduces working memory. Design your workspace to minimize distractions: put your phone in another room, use website blockers, and create a dedicated work zone."
      },
      {
        type: 'heading',
        text: '5. Strategic Caffeine Timing'
      },
      {
        type: 'paragraph',
        text: "Don't drink coffee immediately upon waking—wait 90-120 minutes. Your cortisol (alertness hormone) peaks naturally in the morning, so caffeine is more effective when cortisol begins to decline. This timing strategy can make your coffee 2-3x more effective."
      },
      {
        type: 'heading',
        text: '6. Weekly Reviews'
      },
      {
        type: 'paragraph',
        text: "Spend 30 minutes each week reviewing what worked, what didn't, and planning ahead. This metacognitive practice helps you continuously improve your productivity systems rather than just running on autopilot."
      },
      {
        type: 'heading',
        text: '7. The 80/20 Analysis'
      },
      {
        type: 'paragraph',
        text: "Regularly identify which 20% of your activities produce 80% of your results. Double down on high-impact work and ruthlessly eliminate or delegate the rest. This analysis alone has helped many Wakey users reclaim 10+ hours per week."
      },
      {
        type: 'heading',
        text: '8. Energy Management Over Time Management'
      },
      {
        type: 'paragraph',
        text: "Schedule your most important work during your peak energy hours. For most people, this is 2-4 hours after waking. Use Wakey's energy tracking to discover your personal patterns and optimize accordingly."
      },
      {
        type: 'heading',
        text: '9. Implementation Intentions'
      },
      {
        type: 'paragraph',
        text: "Instead of vague goals like 'exercise more,' create specific if-then plans: 'If it's 7 AM on Monday, Wednesday, or Friday, then I will go to the gym.' Research shows this simple reframing doubles or triples follow-through rates."
      },
      {
        type: 'heading',
        text: '10. The Shutdown Ritual'
      },
      {
        type: 'paragraph',
        text: "End each workday with a consistent routine that signals completion. Review what you accomplished, write tomorrow's priorities, and say a verbal cue like 'shutdown complete.' This creates psychological closure and prevents work thoughts from bleeding into personal time."
      }
    ]
  },
  '3': {
    title: 'Introducing AI Insights',
    excerpt: 'Our new AI-powered feature.',
    category: 'Updates',
    date: 'Jan 15, 2026',
    readTime: '4 min',
    image: blogAiInsights,
    author: 'Harshal Jain',
    content: [
      {
        type: 'paragraph',
        text: "We're thrilled to announce the launch of AI Insights—the most requested feature in Wakey's history. After months of development and beta testing with over 1,000 users, we're rolling out a suite of AI-powered tools designed to transform how you understand and optimize your productivity."
      },
      {
        type: 'heading',
        text: 'What is AI Insights?'
      },
      {
        type: 'paragraph',
        text: "AI Insights uses advanced machine learning to analyze your work patterns, identify trends, and provide personalized recommendations. Unlike generic productivity advice, every suggestion is tailored to your unique working style, goals, and preferences."
      },
      {
        type: 'heading',
        text: 'Key Features'
      },
      {
        type: 'list',
        items: [
          'Pattern Recognition: Automatically identifies your most productive hours, days, and work conditions',
          'Smart Scheduling: Suggests optimal times for different types of tasks based on your historical performance',
          'Distraction Analysis: Tracks what pulls you away from focused work and offers mitigation strategies',
          'Goal Forecasting: Predicts goal completion dates based on current progress and adjusts recommendations',
          'Weekly Digest: Personalized productivity report with actionable insights delivered every Sunday'
        ]
      },
      {
        type: 'heading',
        text: 'Privacy First'
      },
      {
        type: 'paragraph',
        text: "We know productivity data is personal. AI Insights processes all data locally on your device by default. Your patterns and habits never leave your phone or computer unless you explicitly opt into cloud sync. Even then, all data is encrypted end-to-end."
      },
      {
        type: 'heading',
        text: 'Early Results'
      },
      {
        type: 'paragraph',
        text: "During our beta period, users with AI Insights enabled completed 34% more tasks than our control group. Average daily focus time increased by 47 minutes, and user-reported satisfaction scores jumped by 28%. The numbers speak for themselves."
      },
      {
        type: 'heading',
        text: 'Getting Started'
      },
      {
        type: 'paragraph',
        text: "AI Insights is available today for all Pro and Team plan subscribers. Simply update to the latest version of Wakey and look for the new 'Insights' tab in your dashboard. Free users can try AI Insights for 14 days to experience the difference personalized productivity intelligence makes."
      },
      {
        type: 'paragraph',
        text: "This is just the beginning. We're already working on the next generation of AI features, including conversational productivity coaching and predictive task prioritization. Stay tuned—the future of productivity is personal."
      }
    ]
  },
  '4': {
    title: 'Building a Morning Routine That Sticks',
    excerpt: 'Design your ideal morning.',
    category: 'Tips',
    date: 'Jan 12, 2026',
    readTime: '7 min',
    image: blogMorningRoutine,
    author: 'Harshal Jain',
    content: [
      {
        type: 'paragraph',
        text: "How you start your morning sets the tone for your entire day. Research consistently shows that people with intentional morning routines report higher levels of productivity, lower stress, and greater life satisfaction. But building a routine that actually sticks? That's where most people struggle."
      },
      {
        type: 'heading',
        text: 'The Science of Morning Habits'
      },
      {
        type: 'paragraph',
        text: "Your willpower is a finite resource that depletes throughout the day. Morning is when your self-control reserves are highest, making it the ideal time to tackle important habits. Additionally, cortisol—your alertness hormone—peaks within 30-45 minutes of waking, providing natural energy for demanding activities."
      },
      {
        type: 'heading',
        text: 'The Anchor Habit Strategy'
      },
      {
        type: 'paragraph',
        text: "Instead of overhauling your entire morning, start with one 'anchor habit'—a single, non-negotiable activity that everything else builds around. For many successful people, this is exercise. For others, it's meditation or journaling. The key is choosing something that provides immediate benefits and creates momentum."
      },
      {
        type: 'heading',
        text: 'Designing Your Routine'
      },
      {
        type: 'paragraph',
        text: "The best morning routines share common elements, but the specific activities should reflect your priorities and preferences. Consider including:"
      },
      {
        type: 'list',
        items: [
          'Movement (10-30 minutes): Exercise, stretching, or a short walk',
          'Mindfulness (5-15 minutes): Meditation, gratitude journaling, or deep breathing',
          'Nourishment: A healthy breakfast that fuels your morning',
          'Planning (5-10 minutes): Review your priorities and set daily intentions',
          'Learning (15-30 minutes): Reading, podcasts, or skill development'
        ]
      },
      {
        type: 'heading',
        text: 'The Night-Before Preparation'
      },
      {
        type: 'paragraph',
        text: "Successful mornings actually begin the night before. Prepare your environment to make good choices effortless: lay out workout clothes, prepare breakfast ingredients, and put your phone in another room. Reducing friction and decision-making in the morning preserves your mental energy for what matters."
      },
      {
        type: 'heading',
        text: 'Avoiding Common Pitfalls'
      },
      {
        type: 'paragraph',
        text: "The biggest mistake? Trying to do too much too soon. A 2-hour morning routine sounds impressive but is unsustainable for most people. Start with just 15-30 minutes of intentional morning time. Once that's solid, gradually expand."
      },
      {
        type: 'paragraph',
        text: "Another common trap is the phone check. Reaching for your phone immediately upon waking floods your brain with external demands before you've had a chance to set your own priorities. Protect your first 30-60 minutes from digital distractions."
      },
      {
        type: 'heading',
        text: 'Using Wakey for Morning Success'
      },
      {
        type: 'paragraph',
        text: "Wakey's morning routine feature helps you design and track your ideal start to the day. Set up your routine once, and we'll send gentle reminders at the right times. Track your streak to build momentum, and use AI Insights to discover how your morning habits correlate with daily productivity."
      },
      {
        type: 'paragraph',
        text: "Remember: the goal isn't perfection. Even completing 70% of your morning routine puts you ahead of most people. Start small, be consistent, and let the compound effect work its magic."
      }
    ]
  }
};

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { playClick } = useSound();
  
  const post = id ? blogPosts[id as keyof typeof blogPosts] : null;
  
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="grain">
      <SEO 
        title={post.title}
        description={post.excerpt}
        type="article"
        image={post.image}
        article={{
          publishedTime: post.date,
          author: post.author,
          section: post.category,
        }}
      />
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <article className="max-w-3xl mx-auto">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/blog"
              onClick={playClick}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="text-primary text-sm font-medium">{post.category}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif mt-2 mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>By {post.author}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime} read
              </span>
            </div>
          </motion.header>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="aspect-video rounded-xl overflow-hidden mb-10"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Share Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-3 mb-10"
          >
            <SocialShare title={post.title} />
            <button
              onClick={playClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted hover:border-primary/30 transition-all text-sm group"
            >
              <Bookmark className="w-4 h-4 group-hover:text-primary transition-colors" />
              Save
            </button>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            {post.content.map((block, index) => {
              if (block.type === 'paragraph') {
                return (
                  <p key={index} className="text-muted-foreground leading-relaxed mb-6">
                    {block.text}
                  </p>
                );
              }
              if (block.type === 'heading') {
                return (
                  <h2 key={index} className="text-xl font-serif mt-10 mb-4 text-foreground">
                    {block.text}
                  </h2>
                );
              }
              if (block.type === 'list' && block.items) {
                return (
                  <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                );
              }
              return null;
            })}
          </motion.div>

          {/* Author Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="premium-card mt-12 flex items-center gap-4"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-medium text-white text-lg"
              style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)' }}
            >
              HJ
            </div>
            <div>
              <h3 className="font-medium">{post.author}</h3>
              <p className="text-sm text-muted-foreground">Founder at Wakey</p>
            </div>
          </motion.div>

          {/* Related Posts */}
          <RelatedPosts 
            currentPostId={id || ''} 
            posts={Object.entries(blogPosts).map(([postId, postData]) => ({
              id: postId,
              title: postData.title,
              excerpt: postData.excerpt,
              category: postData.category,
              readTime: postData.readTime,
              image: postData.image
            }))}
          />
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
