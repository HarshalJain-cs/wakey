'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface WidgetCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export default function WidgetCard({ title, icon, children, className = '', action }: WidgetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-xl text-teal-400">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}
