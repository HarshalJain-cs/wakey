'use client';

import { Download, HelpCircle, Settings, BookOpen, MessageSquare, ExternalLink } from 'lucide-react';
import WidgetCard from './WidgetCard';
import Link from 'next/link';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  external?: boolean;
}

const actions: QuickAction[] = [
  {
    icon: <Download className="w-5 h-5" />,
    label: 'Download Desktop App',
    description: 'Get Wakey for Windows',
    href: '/download',
    external: false,
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: 'Documentation',
    description: 'Learn how to use Wakey',
    href: '/docs',
    external: false,
  },
  {
    icon: <Settings className="w-5 h-5" />,
    label: 'Account Settings',
    description: 'Manage your profile',
    href: '/account/settings',
    external: false,
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'Contact Support',
    description: 'Get help from our team',
    href: '/contact',
    external: false,
  },
];

export default function QuickActionsWidget() {
  return (
    <WidgetCard
      title="Quick Actions"
      icon={<HelpCircle className="w-5 h-5" />}
    >
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            target={action.external ? '_blank' : undefined}
            rel={action.external ? 'noopener noreferrer' : undefined}
            className="flex flex-col items-center gap-2 p-4 bg-dark-900/50 hover:bg-dark-700/50 rounded-xl transition-colors group"
          >
            <div className="p-3 bg-dark-800 group-hover:bg-gradient-to-br group-hover:from-teal-500/20 group-hover:to-purple-500/20 rounded-xl text-dark-400 group-hover:text-teal-400 transition-colors">
              {action.icon}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white flex items-center gap-1">
                {action.label}
                {action.external && <ExternalLink className="w-3 h-3 text-dark-500" />}
              </p>
              <p className="text-xs text-dark-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </WidgetCard>
  );
}
