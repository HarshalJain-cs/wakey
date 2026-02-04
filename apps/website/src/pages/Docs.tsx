import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Calendar, Menu, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSound } from '@/components/effects/SoundEffects';
import SEO from '@/components/SEO';
import DocsSidebar from '@/components/docs/DocsSidebar';
import DocArticleRenderer from '@/components/docs/DocArticleRenderer';
import { docsContent, getArticleById, getCategoryByArticleId, getAllArticles } from '@/data/docsContent';

const Docs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { playClick } = useSound();

  const selectedArticleId = searchParams.get('article');
  const selectedArticle = selectedArticleId ? getArticleById(selectedArticleId) : null;
  const selectedCategory = selectedArticleId ? getCategoryByArticleId(selectedArticleId) : null;

  const handleSelectArticle = (articleId: string) => {
    playClick();
    setSearchParams({ article: articleId });
    setMobileMenuOpen(false);
  };

  const handleBackToOverview = () => {
    playClick();
    setSearchParams({});
  };

  // Filter articles based on search query
  const filteredResults = searchQuery.trim()
    ? getAllArticles().filter(
        article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // SEO data
  const seoTitle = selectedArticle ? selectedArticle.title : 'Documentation';
  const seoDescription = selectedArticle
    ? selectedArticle.description
    : 'Everything you need to know about Wakey. Get started with guides, feature docs, account settings, and security information.';

  return (
    <div className="grain min-h-screen">
      <SEO title={seoTitle} description={seoDescription} />
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-serif mb-4">
              <span className="gradient-text">Documentation</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to know about Wakey
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mb-8 relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none transition-colors"
            />

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchQuery.trim() && filteredResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {filteredResults.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => {
                        handleSelectArticle(article.id);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                    >
                      <div className="font-medium text-foreground text-sm">
                        {article.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {article.description}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
              {searchQuery.trim() && filteredResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 p-4 text-center text-muted-foreground text-sm"
                >
                  No results found for "{searchQuery}"
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="text-sm font-medium">
                {selectedArticle ? selectedArticle.title : 'Browse Topics'}
              </span>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block w-72 flex-shrink-0"
            >
              <div className="sticky top-28 bg-card border border-border rounded-2xl p-4">
                <DocsSidebar
                  selectedArticleId={selectedArticleId}
                  onSelectArticle={handleSelectArticle}
                />
              </div>
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden absolute left-6 right-6 z-40 bg-card border border-border rounded-2xl p-4 shadow-xl"
                >
                  <DocsSidebar
                    selectedArticleId={selectedArticleId}
                    onSelectArticle={handleSelectArticle}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1 min-w-0"
            >
              <AnimatePresence mode="wait">
                {selectedArticle ? (
                  <motion.div
                    key={selectedArticle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-card border border-border rounded-2xl p-6 sm:p-8"
                  >
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                      <button
                        onClick={handleBackToOverview}
                        className="hover:text-foreground transition-colors"
                      >
                        Docs
                      </button>
                      <span>/</span>
                      {selectedCategory && (
                        <>
                          <span>{selectedCategory.title}</span>
                          <span>/</span>
                        </>
                      )}
                      <span className="text-foreground">{selectedArticle.title}</span>
                    </div>

                    {/* Article Header */}
                    <div className="mb-8">
                      <h1 className="text-2xl sm:text-3xl font-serif text-foreground mb-3">
                        {selectedArticle.title}
                      </h1>
                      <p className="text-muted-foreground mb-4">
                        {selectedArticle.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Last updated: {selectedArticle.lastUpdated}
                      </div>
                    </div>

                    {/* Article Content */}
                    <DocArticleRenderer content={selectedArticle.content} />

                    {/* Back Button */}
                    <div className="mt-10 pt-6 border-t border-border">
                      <button
                        onClick={handleBackToOverview}
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to all topics
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {/* Category Cards */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      {docsContent.map((category, index) => {
                        const Icon = category.icon;
                        return (
                          <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                  background:
                                    'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)',
                                }}
                              >
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h2 className="font-serif text-lg text-foreground">
                                  {category.title}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                  {category.articles.length} articles
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {category.description}
                            </p>
                            <ul className="space-y-1">
                              {category.articles.map((article) => (
                                <li key={article.id}>
                                  <button
                                    onClick={() => handleSelectArticle(article.id)}
                                    className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                                  >
                                    {article.title}
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Docs;
