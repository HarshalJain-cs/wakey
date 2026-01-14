import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import DistractionAlert, { useDistractionAlert } from './components/DistractionAlert';
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
export default function App() {
    const [isTracking, setIsTracking] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const navigate = useNavigate();
    const { alert, dismiss, block } = useDistractionAlert();
    const commandPalette = useCommandPalette();
    useEffect(() => {
        // Listen for events from main process
        window.wakey.onTrackingToggle((status) => {
            setIsTracking(status);
        });
        window.wakey.onFocusStart(() => {
            navigate('/focus');
        });
        window.wakey.onNavigate((route) => {
            navigate(route);
        });
        // Get initial tracking status
        window.wakey.getTrackingStatus().then(setIsTracking);
        // Load settings and check if onboarding is needed
        window.wakey.getSettings().then((settings) => {
            setDarkMode(settings.darkMode ?? true);
            // Show onboarding if not completed
            if (!settings.onboardingComplete) {
                setShowOnboarding(true);
            }
        });
        return () => {
            window.wakey.removeAllListeners('tracking-toggle');
            window.wakey.removeAllListeners('focus-start');
            window.wakey.removeAllListeners('navigate');
        };
    }, [navigate]);
    const toggleTracking = async () => {
        const newStatus = await window.wakey.setTrackingStatus(!isTracking);
        setIsTracking(newStatus);
    };
    const toggleDarkMode = async () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        await window.wakey.setSetting('darkMode', newMode);
        document.documentElement.classList.toggle('dark', newMode);
    };
    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
    };
    const handleOnboardingSkip = async () => {
        await window.wakey.setSetting('onboardingComplete', true);
        setShowOnboarding(false);
    };
    return (<div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
            <TitleBar darkMode={darkMode}/>

            <div className="flex flex-1 overflow-hidden">
                <Sidebar isTracking={isTracking} onTrackingToggle={toggleTracking}/>

                <main className="flex-1 overflow-auto bg-dark-900 p-6">
                    <Routes>
                        <Route path="/" element={<Dashboard isTracking={isTracking}/>}/>
                        <Route path="/focus" element={<FocusPage />}/>
                        <Route path="/tasks" element={<TasksPage />}/>
                        <Route path="/projects" element={<ProjectsPage />}/>
                        <Route path="/analytics" element={<AnalyticsPage />}/>
                        <Route path="/research" element={<ResearchPage />}/>
                        <Route path="/integrations" element={<IntegrationsPage />}/>
                        <Route path="/trader" element={<TraderDashboard />}/>
                        <Route path="/developer" element={<DeveloperDashboard />}/>
                        <Route path="/ai-consensus" element={<AIConsensusPage />}/>
                        <Route path="/knowledge" element={<KnowledgePage />}/>
                        <Route path="/agents" element={<AgentsPage />}/>
                        <Route path="/flashcards" element={<FlashcardsPage />}/>
                        <Route path="/achievements" element={<AchievementsPage />}/>
                        <Route path="/cloud-sync" element={<CloudSyncPage />}/>
                        <Route path="/settings" element={<SettingsPage darkMode={darkMode} onDarkModeToggle={toggleDarkMode}/>}/>
                    </Routes>
                </main>
            </div>

            {/* Onboarding Wizard */}
            {showOnboarding && (<OnboardingWizard onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip}/>)}

            {/* Distraction Alert Modal */}
            {alert && (<DistractionAlert app={alert.app} title={alert.title} onDismiss={dismiss} onBlock={block}/>)}

            {/* Command Palette (Ctrl+K) */}
            <CommandPalette isOpen={commandPalette.isOpen} onClose={commandPalette.close} darkMode={darkMode} onDarkModeToggle={toggleDarkMode}/>
        </div>);
}
//# sourceMappingURL=App.js.map