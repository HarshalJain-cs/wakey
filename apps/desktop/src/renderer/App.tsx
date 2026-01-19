import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import ProductivityCoach from './components/ProductivityCoach';
import ShortcutManager from './components/ShortcutManager';
import OnboardingWizard from './components/OnboardingWizard';
import CommandPalette, { useCommandPalette } from './components/CommandPalette';
import Dashboard from './pages/Dashboard';
import FocusPage from './pages/FocusPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import TraderDashboard from './pages/TraderDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import SettingsPage from './pages/SettingsPage';
import AIConsensusPage from './pages/AIConsensusPage';
import KnowledgePage from './pages/KnowledgePage';
import AgentsPage from './pages/AgentsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import ResearchPage from './pages/ResearchPage';
import CloudSyncPage from './pages/CloudSyncPage';
import AchievementsPage from './pages/AchievementsPage';
import AuthPage from './pages/AuthPage';
import GoalsPage from './pages/GoalsPage';
import MusicPage from './pages/MusicPage';
import ShortcutsPage from './pages/ShortcutsPage';
import WorkflowsPage from './pages/WorkflowsPage';
// EyeBreakReminder is now handled by ProductivityCoach/WorkBreakReminder
import * as supabaseAuth from './services/supabase-auth';

export default function App() {
    const [isTracking, setIsTracking] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [requireAuth, setRequireAuth] = useState(true);
    const navigate = useNavigate();
    // ProductivityCoach handles distraction alerts and break reminders internally
    const commandPalette = useCommandPalette();

    useEffect(() => {
        // Check if wakey API is available
        if (!window.wakey) {
            console.warn('Wakey API not available - preload script may not have loaded');
            setAuthLoading(false);
            setIsAuthenticated(true);
            return;
        }

        // Initialize authentication
        const initAuth = async () => {
            try {
                const settings = await window.wakey.getSettings();
                // Check if auth is required (can be toggled off for testing)
                const authRequired = settings.requireAuth !== false;
                setRequireAuth(authRequired);

                if (authRequired && settings.supabaseUrl && settings.supabaseAnonKey) {
                    const authenticated = await supabaseAuth.initSupabase();
                    setIsAuthenticated(authenticated);
                } else if (!authRequired) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth init failed:', error);
                // Allow app to work without auth in case of error
                setIsAuthenticated(true);
            } finally {
                setAuthLoading(false);
            }
        };

        initAuth();

        // Subscribe to auth state changes
        const unsubscribe = supabaseAuth.subscribe((state) => {
            setIsAuthenticated(!!state.user);
        });

        // Setup wakey event listeners (only if wakey is available)
        window.wakey.onTrackingToggle((status) => setIsTracking(status));
        window.wakey.onFocusStart(() => navigate('/focus'));
        window.wakey.onNavigate((route) => navigate(route));
        window.wakey.getTrackingStatus().then(setIsTracking);
        window.wakey.getSettings().then((settings) => {
            setDarkMode(settings.darkMode as boolean ?? true);
            if (!settings.onboardingComplete) setShowOnboarding(true);
        });

        return () => {
            unsubscribe();
            window.wakey?.removeAllListeners('tracking-toggle');
            window.wakey?.removeAllListeners('focus-start');
            window.wakey?.removeAllListeners('navigate');
        };
    }, [navigate]);

    const toggleTracking = async () => {
        if (!window.wakey) return;
        const newStatus = await window.wakey.setTrackingStatus(!isTracking);
        setIsTracking(newStatus);
    };

    const toggleDarkMode = async () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        await window.wakey?.setSetting('darkMode', newMode);
        document.documentElement.classList.toggle('dark', newMode);
    };

    // Show loading spinner while checking auth
    if (authLoading) {
        return (
            <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
                <TitleBar darkMode={darkMode} />
                <div className="flex-1 flex items-center justify-center bg-dark-900">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-dark-400">Loading Wakey...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show auth page if not authenticated and auth is required
    if (requireAuth && !isAuthenticated) {
        return (
            <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
                <TitleBar darkMode={darkMode} />
                <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />
            </div>
        );
    }

    return (
        <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
            <TitleBar darkMode={darkMode} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar isTracking={isTracking} onTrackingToggle={toggleTracking} />
                <main className="flex-1 overflow-auto bg-dark-900 p-6">
                    <Routes>
                        <Route path="/" element={<Dashboard isTracking={isTracking} />} />
                        <Route path="/focus" element={<FocusPage />} />
                        <Route path="/tasks" element={<TasksPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/research" element={<ResearchPage />} />
                        <Route path="/integrations" element={<IntegrationsPage />} />
                        <Route path="/trader" element={<TraderDashboard />} />
                        <Route path="/developer" element={<DeveloperDashboard />} />
                        <Route path="/ai-consensus" element={<AIConsensusPage />} />
                        <Route path="/knowledge" element={<KnowledgePage />} />
                        <Route path="/agents" element={<AgentsPage />} />
                        <Route path="/flashcards" element={<FlashcardsPage />} />
                        <Route path="/cloud-sync" element={<CloudSyncPage />} />
                        <Route path="/achievements" element={<AchievementsPage />} />
                        <Route path="/goals" element={<GoalsPage />} />
                        <Route path="/music" element={<MusicPage />} />
                        <Route path="/shortcuts" element={<ShortcutsPage />} />
                        <Route path="/workflows" element={<WorkflowsPage />} />
                        <Route path="/settings" element={<SettingsPage darkMode={darkMode} onDarkModeToggle={toggleDarkMode} />} />
                    </Routes>
                </main>
            </div>
            {showOnboarding && <OnboardingWizard onComplete={() => setShowOnboarding(false)} onSkip={async () => { await window.wakey?.setSetting('onboardingComplete', true); setShowOnboarding(false); }} />}
            <ProductivityCoach />
            <ShortcutManager />
            <CommandPalette isOpen={commandPalette.isOpen} onClose={commandPalette.close} darkMode={darkMode} onDarkModeToggle={toggleDarkMode} />
        </div>
    );
}
