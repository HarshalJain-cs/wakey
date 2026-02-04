import { Book, Zap, Settings, Shield } from 'lucide-react';

export interface DocArticle {
  id: string;
  title: string;
  description: string;
  content: DocSection[];
  lastUpdated: string;
}

export interface DocSection {
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'callout' | 'steps';
  content?: string;
  items?: string[];
  variant?: 'info' | 'warning' | 'tip';
  language?: string;
}

export interface DocCategory {
  id: string;
  icon: typeof Book;
  title: string;
  description: string;
  articles: DocArticle[];
}

export const docsContent: DocCategory[] = [
  {
    id: 'getting-started',
    icon: Book,
    title: 'Getting Started',
    description: 'Learn the basics of Wakey and set up your account',
    articles: [
      {
        id: 'quick-start-guide',
        title: 'Quick Start Guide',
        description: 'Get up and running with Wakey in under 5 minutes',
        lastUpdated: 'Jan 25, 2026',
        content: [
          { type: 'paragraph', content: 'Welcome to Wakey! This guide will help you get started with the essential features and have you tracking your productivity in no time.' },
          { type: 'heading', content: 'Step 1: Create Your Account' },
          { type: 'paragraph', content: 'If you haven\'t already, sign up for a free Wakey account. You can use your email address or sign in with Google for faster setup.' },
          { type: 'callout', variant: 'tip', content: 'Pro tip: Use the same email you use for work to keep everything organized.' },
          { type: 'heading', content: 'Step 2: Set Your First Goal' },
          { type: 'paragraph', content: 'Goals are the foundation of Wakey. Start by setting a simple daily goal:' },
          { type: 'steps', items: [
            'Navigate to your Dashboard',
            'Click the "+" button next to Daily Goals',
            'Enter your goal (e.g., "Complete 4 hours of focused work")',
            'Set your target time or task count',
            'Click "Create Goal"'
          ]},
          { type: 'heading', content: 'Step 3: Start Your First Focus Session' },
          { type: 'paragraph', content: 'The Focus Mode is where the magic happens. It helps you concentrate on deep work without distractions.' },
          { type: 'list', items: [
            'Click "Start Focus" from the dashboard or use keyboard shortcut ⌘+Shift+F',
            'Choose your focus duration (we recommend starting with 25 minutes)',
            'Optional: Enable distraction blocking to stay on track',
            'Begin working and let Wakey track your progress'
          ]},
          { type: 'callout', variant: 'info', content: 'Your first week is all about building data. The more you use Wakey, the smarter our AI recommendations become.' },
          { type: 'heading', content: 'Step 4: Review Your Progress' },
          { type: 'paragraph', content: 'At the end of each day, check your Analytics tab to see how you did. Look for patterns in your most productive hours and adjust your schedule accordingly.' },
          { type: 'heading', content: 'Next Steps' },
          { type: 'paragraph', content: 'Now that you\'re set up, explore these features to get the most out of Wakey:' },
          { type: 'list', items: [
            'Connect your calendar for automatic time blocking',
            'Set up integrations with your favorite tools',
            'Customize your notification preferences',
            'Invite team members (Pro & Team plans)'
          ]}
        ]
      },
      {
        id: 'your-first-project',
        title: 'Your First Project',
        description: 'Learn how to create and manage projects effectively',
        lastUpdated: 'Jan 22, 2026',
        content: [
          { type: 'paragraph', content: 'Projects in Wakey help you organize related tasks and track time across different work areas. Here\'s how to set up your first project.' },
          { type: 'heading', content: 'Creating a Project' },
          { type: 'steps', items: [
            'From your dashboard, click "Projects" in the sidebar',
            'Click the "New Project" button',
            'Enter a project name and optional description',
            'Choose a color to visually distinguish this project',
            'Set an optional deadline or leave it open-ended',
            'Click "Create" to finish'
          ]},
          { type: 'heading', content: 'Adding Tasks to Your Project' },
          { type: 'paragraph', content: 'Every project can contain multiple tasks. Tasks are the actionable items you\'ll work on during focus sessions.' },
          { type: 'list', items: [
            'Click into your project to open the detail view',
            'Use the "+ Add Task" button to create new tasks',
            'Drag and drop to reorder tasks by priority',
            'Set due dates for time-sensitive items',
            'Add labels for additional categorization'
          ]},
          { type: 'callout', variant: 'tip', content: 'Break large tasks into smaller sub-tasks. This makes progress more visible and keeps you motivated.' },
          { type: 'heading', content: 'Tracking Time on Projects' },
          { type: 'paragraph', content: 'When you start a focus session, you can associate it with a specific project. This helps you understand where your time goes across different areas of your work.' },
          { type: 'heading', content: 'Project Analytics' },
          { type: 'paragraph', content: 'Each project has its own analytics view showing:' },
          { type: 'list', items: [
            'Total time invested',
            'Task completion rate',
            'Average focus session duration',
            'Team member contributions (Team plan)',
            'Progress toward project goals'
          ]}
        ]
      },
      {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'Understand your productivity command center',
        lastUpdated: 'Jan 20, 2026',
        content: [
          { type: 'paragraph', content: 'The Wakey Dashboard is your central hub for productivity. It gives you a real-time view of your progress, goals, and insights.' },
          { type: 'heading', content: 'Dashboard Components' },
          { type: 'paragraph', content: 'Your dashboard is divided into several key areas:' },
          { type: 'heading', content: 'Daily Progress Ring' },
          { type: 'paragraph', content: 'The large circular indicator at the top shows your daily goal completion. As you complete focus sessions and tasks, watch it fill up toward 100%.' },
          { type: 'heading', content: 'Today\'s Focus Stats' },
          { type: 'paragraph', content: 'Quick metrics showing:' },
          { type: 'list', items: [
            'Total focus time today',
            'Number of completed focus sessions',
            'Tasks completed',
            'Current streak (consecutive productive days)'
          ]},
          { type: 'heading', content: 'Active Projects' },
          { type: 'paragraph', content: 'A quick view of your most active projects with progress indicators. Click any project to jump directly to it.' },
          { type: 'heading', content: 'AI Insights Panel' },
          { type: 'paragraph', content: 'Personalized recommendations based on your work patterns. This might include:' },
          { type: 'list', items: [
            'Best time to schedule deep work',
            'Suggestions for improving focus',
            'Trends in your productivity',
            'Upcoming goals at risk'
          ]},
          { type: 'callout', variant: 'info', content: 'The more you use Wakey, the more accurate and helpful these insights become.' },
          { type: 'heading', content: 'Recent Activity' },
          { type: 'paragraph', content: 'A timeline of your recent work showing completed sessions, achieved goals, and task completions. Great for quick status checks.' },
          { type: 'heading', content: 'Customizing Your Dashboard' },
          { type: 'paragraph', content: 'Rearrange dashboard widgets by dragging them. Hide panels you don\'t need from Settings > Dashboard > Customize Layout.' }
        ]
      }
    ]
  },
  {
    id: 'features',
    icon: Zap,
    title: 'Features',
    description: 'Deep dive into Wakey\'s powerful features',
    articles: [
      {
        id: 'ai-insights',
        title: 'AI Insights',
        description: 'Understand and leverage AI-powered productivity recommendations',
        lastUpdated: 'Jan 24, 2026',
        content: [
          { type: 'paragraph', content: 'Wakey\'s AI Insights feature uses machine learning to analyze your work patterns and provide personalized recommendations for improving productivity.' },
          { type: 'heading', content: 'How AI Insights Works' },
          { type: 'paragraph', content: 'Our AI continuously learns from your behavior:' },
          { type: 'list', items: [
            'When you\'re most focused during the day',
            'What types of tasks you complete fastest',
            'Patterns in your distraction triggers',
            'Your optimal focus session length',
            'How breaks affect your productivity'
          ]},
          { type: 'heading', content: 'Types of Insights' },
          { type: 'paragraph', content: 'You\'ll receive several categories of insights:' },
          { type: 'heading', content: 'Peak Performance Windows' },
          { type: 'paragraph', content: 'AI identifies your most productive hours. Schedule important work during these windows for best results.' },
          { type: 'heading', content: 'Smart Scheduling' },
          { type: 'paragraph', content: 'Based on your patterns, AI suggests optimal times for different task types. Creative work might be best in the morning, while administrative tasks fit better in the afternoon.' },
          { type: 'callout', variant: 'tip', content: 'Check your insights every Monday morning to plan your most productive week yet.' },
          { type: 'heading', content: 'Distraction Analysis' },
          { type: 'paragraph', content: 'Track what pulls you away from focused work. AI helps identify:' },
          { type: 'list', items: [
            'Most common distraction sources',
            'Times when you\'re most susceptible',
            'Strategies that work for your personality',
            'Progress in reducing distractions over time'
          ]},
          { type: 'heading', content: 'Weekly Digest' },
          { type: 'paragraph', content: 'Every Sunday evening, you\'ll receive a personalized email summarizing your week\'s productivity with actionable recommendations for improvement.' },
          { type: 'heading', content: 'Privacy & Data' },
          { type: 'paragraph', content: 'All AI processing happens locally on your device by default. Your personal productivity data never leaves your device unless you opt into cloud sync, which uses end-to-end encryption.' }
        ]
      },
      {
        id: 'focus-mode',
        title: 'Focus Mode',
        description: 'Master distraction-free deep work sessions',
        lastUpdated: 'Jan 23, 2026',
        content: [
          { type: 'paragraph', content: 'Focus Mode is Wakey\'s core feature for deep work. It combines time tracking, distraction blocking, and ambient features to help you achieve flow state.' },
          { type: 'heading', content: 'Starting a Focus Session' },
          { type: 'steps', items: [
            'Click "Start Focus" from the dashboard or press ⌘+Shift+F',
            'Select the task or project you\'re working on (optional)',
            'Choose your desired focus duration',
            'Configure any additional settings',
            'Click "Begin" to start the timer'
          ]},
          { type: 'heading', content: 'Focus Duration Options' },
          { type: 'paragraph', content: 'Choose from preset durations or create custom ones:' },
          { type: 'list', items: [
            'Pomodoro (25 min) - Classic technique for beginners',
            'Deep Focus (50 min) - Extended concentration periods',
            'Flow State (90 min) - For complex, creative work',
            'Custom - Set any duration that works for you'
          ]},
          { type: 'callout', variant: 'info', content: 'AI will learn your optimal session length over time and suggest adjustments.' },
          { type: 'heading', content: 'Distraction Blocking' },
          { type: 'paragraph', content: 'When enabled, distraction blocking helps you stay focused:' },
          { type: 'list', items: [
            'Blocks distracting websites you\'ve identified',
            'Mutes non-essential notifications',
            'Optional: Blocks all apps except work tools',
            'Customizable blocklist per project or task'
          ]},
          { type: 'heading', content: 'Ambient Sounds' },
          { type: 'paragraph', content: 'Choose from several ambient soundscapes to enhance concentration:' },
          { type: 'list', items: [
            'Coffee Shop - Light background chatter',
            'Rain - Gentle rainfall sounds',
            'Forest - Natural woodland ambience',
            'White Noise - Pure focus sound',
            'Binaural Beats - Scientifically designed focus audio'
          ]},
          { type: 'heading', content: 'Taking Breaks' },
          { type: 'paragraph', content: 'Breaks are essential for sustained productivity. Wakey reminds you to take breaks and tracks your rest periods. The recommended pattern is 5 minutes after each 25-minute session, or 15 minutes after 90 minutes of deep work.' }
        ]
      },
      {
        id: 'time-tracking',
        title: 'Time Tracking',
        description: 'Automatic and manual time tracking for all your work',
        lastUpdated: 'Jan 21, 2026',
        content: [
          { type: 'paragraph', content: 'Wakey offers both automatic and manual time tracking so you can understand exactly where your time goes.' },
          { type: 'heading', content: 'Automatic Tracking' },
          { type: 'paragraph', content: 'When enabled, Wakey automatically tracks:' },
          { type: 'list', items: [
            'Active application usage',
            'Website visits (with optional URL tracking)',
            'Focus session duration',
            'Break times and idle periods',
            'Meeting time (calendar integration required)'
          ]},
          { type: 'callout', variant: 'warning', content: 'Automatic tracking requires the Wakey desktop app for full functionality.' },
          { type: 'heading', content: 'Manual Time Entry' },
          { type: 'paragraph', content: 'For offline work or to add historical data:' },
          { type: 'steps', items: [
            'Go to Analytics > Time Entries',
            'Click "+ Add Entry"',
            'Select the project and task',
            'Enter start and end times',
            'Add optional notes',
            'Click "Save"'
          ]},
          { type: 'heading', content: 'Time Reports' },
          { type: 'paragraph', content: 'Generate detailed reports for any time period:' },
          { type: 'list', items: [
            'Daily, weekly, and monthly summaries',
            'Project and task breakdowns',
            'Comparison with previous periods',
            'Export to CSV or PDF',
            'Team reports (Team plan)'
          ]},
          { type: 'heading', content: 'Categories & Tags' },
          { type: 'paragraph', content: 'Organize your time entries with categories (e.g., "Meetings", "Deep Work", "Admin") and custom tags for granular analysis.' }
        ]
      }
    ]
  },
  {
    id: 'account',
    icon: Settings,
    title: 'Account',
    description: 'Manage your account settings and preferences',
    articles: [
      {
        id: 'billing',
        title: 'Billing & Subscriptions',
        description: 'Manage your subscription and payment methods',
        lastUpdated: 'Jan 24, 2026',
        content: [
          { type: 'paragraph', content: 'Manage your Wakey subscription, payment methods, and billing history all in one place.' },
          { type: 'heading', content: 'Subscription Plans' },
          { type: 'paragraph', content: 'Wakey offers three plans to fit your needs:' },
          { type: 'list', items: [
            'Free - Basic features, 3 projects, limited analytics',
            'Pro ($2.50/week or $100/year) - Full features, unlimited projects, AI insights',
            'Team ($7/week or $150/year per user) - Everything in Pro plus team features'
          ]},
          { type: 'heading', content: 'Upgrading Your Plan' },
          { type: 'steps', items: [
            'Go to Settings > Billing',
            'Click "Upgrade Plan"',
            'Select your desired plan',
            'Choose weekly or yearly billing',
            'Enter payment details',
            'Confirm your upgrade'
          ]},
          { type: 'callout', variant: 'tip', content: 'Yearly billing saves you up to 25% compared to weekly payments.' },
          { type: 'heading', content: 'Payment Methods' },
          { type: 'paragraph', content: 'We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe.' },
          { type: 'heading', content: 'Billing History' },
          { type: 'paragraph', content: 'View and download invoices for all past payments in Settings > Billing > History. Invoices are automatically emailed after each payment.' },
          { type: 'heading', content: 'Cancellation' },
          { type: 'paragraph', content: 'You can cancel your subscription at any time. You\'ll retain access to paid features until the end of your current billing period. No refunds for partial periods, but we offer a 30-day money-back guarantee for new subscribers.' }
        ]
      },
      {
        id: 'team-settings',
        title: 'Team Settings',
        description: 'Configure your team workspace and member permissions',
        lastUpdated: 'Jan 22, 2026',
        content: [
          { type: 'paragraph', content: 'Team settings allow workspace administrators to manage members, permissions, and team-wide configurations.' },
          { type: 'callout', variant: 'info', content: 'Team features require a Team plan subscription.' },
          { type: 'heading', content: 'Inviting Team Members' },
          { type: 'steps', items: [
            'Go to Settings > Team',
            'Click "Invite Members"',
            'Enter email addresses (one per line)',
            'Select their role (Member or Admin)',
            'Click "Send Invites"'
          ]},
          { type: 'heading', content: 'Member Roles' },
          { type: 'paragraph', content: 'Two roles are available:' },
          { type: 'list', items: [
            'Admin - Full access to team settings, billing, and member management',
            'Member - Access to shared projects and personal features'
          ]},
          { type: 'heading', content: 'Team Projects' },
          { type: 'paragraph', content: 'Create shared projects that all team members can access. Team projects support:' },
          { type: 'list', items: [
            'Collaborative task management',
            'Shared time tracking',
            'Team analytics and reports',
            'Project-level permissions'
          ]},
          { type: 'heading', content: 'Team Analytics' },
          { type: 'paragraph', content: 'View aggregated team productivity metrics while respecting individual privacy. Admins can see high-level trends without accessing personal focus data.' }
        ]
      },
      {
        id: 'data-export',
        title: 'Data Export',
        description: 'Export your data for backup or migration',
        lastUpdated: 'Jan 20, 2026',
        content: [
          { type: 'paragraph', content: 'Wakey makes it easy to export your data. You own your data and can download it anytime.' },
          { type: 'heading', content: 'What You Can Export' },
          { type: 'list', items: [
            'Profile information',
            'All projects and tasks',
            'Time entries and focus sessions',
            'Goals and achievements',
            'Settings and preferences'
          ]},
          { type: 'heading', content: 'Export Formats' },
          { type: 'paragraph', content: 'Choose the format that works for your needs:' },
          { type: 'list', items: [
            'JSON - Complete data, ideal for developers or data analysis',
            'CSV - Spreadsheet-compatible, great for Excel or Google Sheets'
          ]},
          { type: 'heading', content: 'How to Export' },
          { type: 'steps', items: [
            'Go to Settings > Data & Privacy',
            'Click "Export My Data"',
            'Select the data types to include',
            'Choose your preferred format',
            'Click "Generate Export"',
            'Download when ready (usually within minutes)'
          ]},
          { type: 'callout', variant: 'info', content: 'Large exports may take a few minutes to prepare. You\'ll receive an email when your download is ready.' },
          { type: 'heading', content: 'Scheduled Exports' },
          { type: 'paragraph', content: 'Pro and Team users can set up automatic weekly or monthly exports that are emailed directly to you.' }
        ]
      }
    ]
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security',
    description: 'Keep your account and data secure',
    articles: [
      {
        id: '2fa-setup',
        title: 'Two-Factor Authentication',
        description: 'Add an extra layer of security to your account',
        lastUpdated: 'Jan 25, 2026',
        content: [
          { type: 'paragraph', content: 'Two-factor authentication (2FA) adds an extra layer of security by requiring a second form of verification when signing in.' },
          { type: 'heading', content: 'Why Use 2FA?' },
          { type: 'paragraph', content: 'Even if someone obtains your password, they won\'t be able to access your account without the second factor. We strongly recommend enabling 2FA for all accounts.' },
          { type: 'heading', content: 'Setting Up 2FA' },
          { type: 'steps', items: [
            'Go to Settings > Security',
            'Click "Enable Two-Factor Authentication"',
            'Download an authenticator app if you don\'t have one (Google Authenticator, Authy, 1Password)',
            'Scan the QR code with your authenticator app',
            'Enter the 6-digit code from your app',
            'Save your backup codes in a secure location'
          ]},
          { type: 'callout', variant: 'warning', content: 'Store your backup codes safely! They\'re the only way to recover your account if you lose access to your authenticator.' },
          { type: 'heading', content: 'Backup Codes' },
          { type: 'paragraph', content: 'When you enable 2FA, you\'ll receive 8 backup codes. Each code can only be used once. Store them securely—they\'re your recovery option if you lose your phone.' },
          { type: 'heading', content: 'Disabling 2FA' },
          { type: 'paragraph', content: 'If you need to disable 2FA, go to Settings > Security and click "Disable 2FA". You\'ll need to verify with your current method first.' }
        ]
      },
      {
        id: 'privacy',
        title: 'Privacy & Data Protection',
        description: 'How we protect and handle your personal data',
        lastUpdated: 'Jan 23, 2026',
        content: [
          { type: 'paragraph', content: 'Your privacy is important to us. Here\'s how Wakey handles your data.' },
          { type: 'heading', content: 'Data Collection' },
          { type: 'paragraph', content: 'We collect only the data necessary to provide our service:' },
          { type: 'list', items: [
            'Account information (email, name)',
            'Productivity data (focus sessions, tasks, time entries)',
            'Usage analytics (feature usage, not content)',
            'Technical data (device type, app version)'
          ]},
          { type: 'heading', content: 'Data Storage' },
          { type: 'paragraph', content: 'All data is encrypted at rest and in transit. We use industry-standard AES-256 encryption. Servers are located in secure, SOC 2 certified data centers.' },
          { type: 'heading', content: 'Local Processing' },
          { type: 'paragraph', content: 'AI Insights can process data locally on your device, meaning your personal patterns never leave your computer or phone. Cloud sync is optional and uses end-to-end encryption.' },
          { type: 'callout', variant: 'info', content: 'You can use Wakey in offline mode with all data stored locally on your device.' },
          { type: 'heading', content: 'Third-Party Sharing' },
          { type: 'paragraph', content: 'We never sell your personal data. We only share data with:' },
          { type: 'list', items: [
            'Payment processors (Stripe) for billing',
            'Infrastructure providers under strict data processing agreements',
            'When legally required (with user notification when possible)'
          ]},
          { type: 'heading', content: 'Your Rights' },
          { type: 'paragraph', content: 'You have the right to access, correct, delete, or export your data at any time. See our Data Export guide for instructions.' }
        ]
      },
      {
        id: 'gdpr',
        title: 'GDPR Compliance',
        description: 'Our commitment to European data protection regulations',
        lastUpdated: 'Jan 21, 2026',
        content: [
          { type: 'paragraph', content: 'Wakey is fully compliant with the General Data Protection Regulation (GDPR). Here\'s what that means for you.' },
          { type: 'heading', content: 'Your GDPR Rights' },
          { type: 'paragraph', content: 'Under GDPR, you have the following rights:' },
          { type: 'list', items: [
            'Right to Access - Request a copy of your data',
            'Right to Rectification - Correct inaccurate data',
            'Right to Erasure - Request deletion of your data',
            'Right to Portability - Export your data in standard formats',
            'Right to Restrict Processing - Limit how we use your data',
            'Right to Object - Object to certain data processing'
          ]},
          { type: 'heading', content: 'Exercising Your Rights' },
          { type: 'paragraph', content: 'To exercise any of these rights:' },
          { type: 'steps', items: [
            'Email privacy@wakey.app with your request',
            'Include your account email for verification',
            'Specify which right you wish to exercise',
            'We\'ll respond within 30 days as required by law'
          ]},
          { type: 'heading', content: 'Data Processing Agreement' },
          { type: 'paragraph', content: 'For Team plan customers who need a Data Processing Agreement (DPA) for compliance purposes, contact our support team.' },
          { type: 'callout', variant: 'info', content: 'For business or enterprise data processing agreements, email legal@wakey.app.' },
          { type: 'heading', content: 'Data Retention' },
          { type: 'paragraph', content: 'We retain your data for as long as your account is active. After account deletion, data is permanently removed within 30 days from our systems and within 90 days from backups.' }
        ]
      }
    ]
  }
];

export const getAllArticles = (): DocArticle[] => {
  return docsContent.flatMap(category => category.articles);
};

export const getArticleById = (id: string): DocArticle | undefined => {
  return getAllArticles().find(article => article.id === id);
};

export const getCategoryByArticleId = (articleId: string): DocCategory | undefined => {
  return docsContent.find(category => 
    category.articles.some(article => article.id === articleId)
  );
};
