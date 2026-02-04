import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Index from '@/pages/Index';
import About from '@/pages/About';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Docs from '@/pages/Docs';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import VerifyEmail from '@/pages/VerifyEmail';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import FocusMode from '@/pages/FocusMode';
import Analytics from '@/pages/Analytics';
import Integrations from '@/pages/Integrations';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Security from '@/pages/Security';
import Changelog from '@/pages/Changelog';
import Roadmap from '@/pages/Roadmap';
import Careers from '@/pages/Careers';
import API from '@/pages/API';
import Community from '@/pages/Community';
import Press from '@/pages/Press';
import AuthCallback from '@/pages/AuthCallback';
import Download from '@/pages/Download';
import Checkout from '@/pages/Checkout';
import ComingSoon from '@/pages/ComingSoon';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
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
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
