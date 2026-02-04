import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  article?: {
    publishedTime?: string;
    author?: string;
    section?: string;
  };
}

const DEFAULT_TITLE = 'Wakey - Wake Up Your Potential';
const DEFAULT_DESCRIPTION = 'Wakey is the productivity app that helps you focus, track progress, and achieve your goals with AI-powered insights.';
const DEFAULT_IMAGE = '/brand/wakey-og-image.png';
const SITE_NAME = 'Wakey';
const TWITTER_HANDLE = '@harryyy_cs';

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  article,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  
  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMeta = (selector: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr === 'property' ? 'property' : 'name', selector.replace(/\[.*$/, '').replace('meta[name="', '').replace('meta[property="', '').replace('"]', ''));
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Get absolute image URL
    const imageUrl = image.startsWith('http') 
      ? image 
      : `${window.location.origin}${image}`;

    // Primary Meta Tags
    updateMeta('meta[name="description"]', description);

    // Open Graph
    updateMeta('meta[property="og:type"]', type, 'property');
    updateMeta('meta[property="og:url"]', window.location.href, 'property');
    updateMeta('meta[property="og:title"]', fullTitle, 'property');
    updateMeta('meta[property="og:description"]', description, 'property');
    updateMeta('meta[property="og:image"]', imageUrl, 'property');
    updateMeta('meta[property="og:site_name"]', SITE_NAME, 'property');

    // Twitter
    updateMeta('meta[name="twitter:card"]', 'summary_large_image');
    updateMeta('meta[name="twitter:url"]', window.location.href);
    updateMeta('meta[name="twitter:title"]', fullTitle);
    updateMeta('meta[name="twitter:description"]', description);
    updateMeta('meta[name="twitter:image"]', imageUrl);
    updateMeta('meta[name="twitter:site"]', TWITTER_HANDLE);
    updateMeta('meta[name="twitter:creator"]', TWITTER_HANDLE);

    // Article-specific tags
    if (type === 'article' && article) {
      if (article.publishedTime) {
        updateMeta('meta[property="article:published_time"]', article.publishedTime, 'property');
      }
      if (article.author) {
        updateMeta('meta[property="article:author"]', article.author, 'property');
      }
      if (article.section) {
        updateMeta('meta[property="article:section"]', article.section, 'property');
      }
    }

    // Cleanup: reset to defaults when component unmounts
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [fullTitle, description, image, type, article]);

  return null;
};

export default SEO;
