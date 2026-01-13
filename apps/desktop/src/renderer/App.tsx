import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import DistractionAlert, { useDistractionAlert } from './components/DistractionAlert';
import Dashboard from './pages/Dashboard';
import FocusPage from './pages/FocusPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
    const [isTracking, setIsTracking] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const navigate = useNavigate();
    const { alert, dismiss, block } = useDistractionAlert();

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

        // Load settings
        window.wakey.getSettings().then((settings) => {
            setDarkMode(settings.darkMode as boolean ?? true);
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

    return (
        <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
            <TitleBar darkMode={darkMode} />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    isTracking={isTracking}
                    onTrackingToggle={toggleTracking}
                />

                <main className="flex-1 overflow-auto bg-dark-900 p-6">
                    <Routes>
                        <Route path="/" element={<Dashboard isTracking={isTracking} />} />
                        <Route path="/focus" element={<FocusPage />} />
                        <Route path="/tasks" element={<TasksPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/settings" element={
                            <SettingsPage
                                darkMode={darkMode}
                                onDarkModeToggle={toggleDarkMode}
                            />
                        } />
                    </Routes>
                </main>
            </div>

            {/* Distraction Alert Modal */}
            {alert && (
                <DistractionAlert
                    app={alert.app}
                    title={alert.title}
                    onDismiss={dismiss}
                    onBlock={block}
                />
            )}
        </div>
    );
}
