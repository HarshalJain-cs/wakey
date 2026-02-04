import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Suspense, lazy } from 'react';
import PageTransition from './PageTransition';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Lazy load all pages for better performance
const Index = lazy(() => import('@/pages/Index'));
const About = lazy(() => import('@/pages/About'));
const Features = lazy(() => import('@/pages/Features'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const Docs = lazy(() => import('@/pages/Docs'));
const Contact = lazy(() => import('@/pages/Contact'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const FocusMode = lazy(() => import('@/pages/FocusMode'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Integrations = lazy(() => import('@/pages/Integrations'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Security = lazy(() => import('@/pages/Security'));
const Changelog = lazy(() => import('@/pages/Changelog'));
const Roadmap = lazy(() => import('@/pages/Roadmap'));
const Careers = lazy(() => import('@/pages/Careers'));
const API = lazy(() => import('@/pages/API'));
const Community = lazy(() => import('@/pages/Community'));
const Press = lazy(() => import('@/pages/Press'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const Download = lazy(() => import('@/pages/Download'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const ComingSoon = lazy(() => import('@/pages/ComingSoon'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Index />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />
          <Route
            path="/features"
            element={
              <PageTransition>
                <Features />
              </PageTransition>
            }
          />
          <Route
            path="/pricing"
            element={
              <PageTransition>
                <Pricing />
              </PageTransition>
            }
          />
          <Route
            path="/blog"
            element={
              <PageTransition>
                <Blog />
              </PageTransition>
            }
          />
          <Route
            path="/blog/:id"
            element={
              <PageTransition>
                <BlogPost />
              </PageTransition>
            }
          />
          <Route
            path="/docs"
            element={
              <PageTransition>
                <Docs />
              </PageTransition>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <Contact />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/signup"
            element={
              <PageTransition>
                <Signup />
              </PageTransition>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PageTransition>
                <VerifyEmail />
              </PageTransition>
            }
          />
          <Route
            path="/auth/callback"
            element={
              <PageTransition>
                <AuthCallback />
              </PageTransition>
            }
          />
          <Route
            path="/download"
            element={
              <PageTransition>
                <Download />
              </PageTransition>
            }
          />
          <Route
            path="/coming-soon"
            element={
              <PageTransition>
                <ComingSoon />
              </PageTransition>
            }
          />
          <Route
            path="/checkout"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/profile"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/settings"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/focus"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <FocusMode />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/focus-mode"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <FocusMode />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/analytics"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/integrations"
            element={
              <PageTransition>
                <ProtectedRoute>
                  <Integrations />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/privacy"
            element={
              <PageTransition>
                <Privacy />
              </PageTransition>
            }
          />
          <Route
            path="/terms"
            element={
              <PageTransition>
                <Terms />
              </PageTransition>
            }
          />
          <Route
            path="/security"
            element={
              <PageTransition>
                <Security />
              </PageTransition>
            }
          />
          <Route
            path="/changelog"
            element={
              <PageTransition>
                <Changelog />
              </PageTransition>
            }
          />
          <Route
            path="/roadmap"
            element={
              <PageTransition>
                <Roadmap />
              </PageTransition>
            }
          />
          <Route
            path="/careers"
            element={
              <PageTransition>
                <Careers />
              </PageTransition>
            }
          />
          <Route
            path="/api"
            element={
              <PageTransition>
                <API />
              </PageTransition>
            }
          />
          <Route
            path="/community"
            element={
              <PageTransition>
                <Community />
              </PageTransition>
            }
          />
          <Route
            path="/press"
            element={
              <PageTransition>
                <Press />
              </PageTransition>
            }
          />
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
