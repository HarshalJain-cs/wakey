import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { docsContent, type DocCategory, type DocArticle } from '@/data/docsContent';
import { cn } from '@/lib/utils';

interface DocsSidebarProps {
  selectedArticleId: string | null;
  onSelectArticle: (articleId: string) => void;
}

const DocsSidebar = ({ selectedArticleId, onSelectArticle }: DocsSidebarProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    docsContent.map(c => c.id) // All expanded by default
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <nav className="space-y-2">
      {docsContent.map((category) => {
        const isExpanded = expandedCategories.includes(category.id);
        const Icon = category.icon;

        return (
          <div key={category.id} className="space-y-1">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted/50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="flex-1 font-medium text-foreground text-sm">
                {category.title}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </button>

            <motion.div
              initial={false}
              animate={{
                height: isExpanded ? 'auto' : 0,
                opacity: isExpanded ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pl-11 space-y-0.5 pb-2">
                {category.articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => onSelectArticle(article.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      selectedArticleId === article.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    )}
                  >
                    {article.title}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        );
      })}
    </nav>
  );
};

export default DocsSidebar;
