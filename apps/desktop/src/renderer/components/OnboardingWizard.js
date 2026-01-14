import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Zap, Target, Brain, Clock, CheckCircle, Sparkles, Key, AlertTriangle } from 'lucide-react';
export default function OnboardingWizard({ onComplete, onSkip }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [groqApiKey, setGroqApiKey] = useState('');
    const [dailyGoal, setDailyGoal] = useState(240);
    const [autoTrack, setAutoTrack] = useState(false);
    const steps = [
        {
            id: 0,
            title: 'Welcome to Wakey!',
            description: 'Your AI-powered productivity companion',
            icon: Sparkles,
            content: (<div className="text-center py-8">
                    <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-10 h-10 text-primary-400"/>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Welcome to Wakey!</h2>
                    <p className="text-dark-400 max-w-md mx-auto">
                        Wakey helps you track your time, stay focused, and unlock AI-powered insights
                        about your productivity patterns.
                    </p>
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        {[
                    { icon: Clock, label: 'Track Time' },
                    { icon: Target, label: 'Stay Focused' },
                    { icon: Brain, label: 'AI Insights' },
                ].map(({ icon: Icon, label }) => (<div key={label} className="p-4 bg-dark-700 rounded-xl">
                                <Icon className="w-6 h-6 text-primary-400 mx-auto mb-2"/>
                                <span className="text-sm text-dark-300">{label}</span>
                            </div>))}
                    </div>
                </div>),
        },
        {
            id: 1,
            title: 'Set Your Daily Goal',
            description: 'How much focused work do you want to achieve?',
            icon: Target,
            content: (<div className="py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Target className="w-8 h-8 text-green-400"/>
                    </div>
                    <h2 className="text-xl font-bold text-white text-center mb-6">
                        Set Your Daily Focus Goal
                    </h2>
                    <div className="max-w-sm mx-auto">
                        <div className="text-center mb-6">
                            <span className="text-4xl font-bold text-primary-400">
                                {Math.floor(dailyGoal / 60)}h {dailyGoal % 60}m
                            </span>
                            <p className="text-dark-400 mt-2">per day</p>
                        </div>
                        <input type="range" min="60" max="480" step="30" value={dailyGoal} onChange={(e) => setDailyGoal(parseInt(e.target.value))} className="w-full accent-primary-500"/>
                        <div className="flex justify-between text-xs text-dark-500 mt-2">
                            <span>1 hour</span>
                            <span>8 hours</span>
                        </div>
                    </div>
                </div>),
        },
        {
            id: 2,
            title: 'Configure Tracking',
            description: 'How would you like Wakey to track your time?',
            icon: Zap,
            content: (<div className="py-8">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-8 h-8 text-yellow-400"/>
                    </div>
                    <h2 className="text-xl font-bold text-white text-center mb-6">
                        Tracking Preferences
                    </h2>
                    <div className="max-w-sm mx-auto space-y-4">
                        <button onClick={() => setAutoTrack(!autoTrack)} className={`w-full p-4 rounded-xl border transition-colors text-left ${autoTrack
                    ? 'bg-primary-500/20 border-primary-500 text-white'
                    : 'bg-dark-700 border-dark-600 text-dark-300 hover:border-dark-500'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">Auto-start Tracking</div>
                                    <div className="text-sm text-dark-400">
                                        Start tracking when Wakey launches
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 ${autoTrack ? 'bg-primary-500 border-primary-500' : 'border-dark-500'}`}>
                                    {autoTrack && <CheckCircle className="w-full h-full text-white"/>}
                                </div>
                            </div>
                        </button>

                        <div className="p-4 bg-dark-700 rounded-xl border border-dark-600">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5"/>
                                <div>
                                    <div className="font-medium text-white">Distraction Alerts</div>
                                    <div className="text-sm text-dark-400">
                                        You'll be alerted when using distracting apps during focus time.
                                        Customize which apps are distractions in Settings.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>),
        },
        {
            id: 3,
            title: 'AI Setup (Optional)',
            description: 'Connect AI for smarter insights',
            icon: Brain,
            content: (<div className="py-8">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-8 h-8 text-purple-400"/>
                    </div>
                    <h2 className="text-xl font-bold text-white text-center mb-2">
                        Enable AI Features
                    </h2>
                    <p className="text-dark-400 text-center mb-6">
                        Add your Groq API key for AI-powered insights (optional)
                    </p>
                    <div className="max-w-sm mx-auto space-y-4">
                        <div>
                            <label className="block text-sm text-dark-300 mb-2">
                                <Key className="w-4 h-4 inline mr-2"/>
                                Groq API Key
                            </label>
                            <input type="password" value={groqApiKey} onChange={(e) => setGroqApiKey(e.target.value)} placeholder="gsk_..." className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"/>
                        </div>
                        <p className="text-xs text-dark-500">
                            Get your free API key from{' '}
                            <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                                console.groq.com
                            </a>
                        </p>
                        <p className="text-xs text-dark-500 text-center">
                            You can skip this step and add it later in Settings.
                        </p>
                    </div>
                </div>),
        },
        {
            id: 4,
            title: "You're All Set!",
            description: 'Start your productivity journey',
            icon: CheckCircle,
            content: (<div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-400"/>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">You're All Set!</h2>
                    <p className="text-dark-400 max-w-md mx-auto mb-8">
                        Wakey is ready to help you stay focused and productive.
                        Start tracking now or explore the dashboard.
                    </p>
                    <div className="bg-dark-700 rounded-xl p-4 max-w-sm mx-auto">
                        <h3 className="font-medium text-white mb-3">Quick Tips:</h3>
                        <ul className="text-sm text-dark-400 text-left space-y-2">
                            <li>• Press <kbd className="px-2 py-0.5 bg-dark-600 rounded text-xs">Ctrl+Shift+F</kbd> to start a focus session</li>
                            <li>• Press <kbd className="px-2 py-0.5 bg-dark-600 rounded text-xs">Ctrl+Shift+T</kbd> to toggle tracking</li>
                            <li>• Click "Customize" on the dashboard to arrange widgets</li>
                        </ul>
                    </div>
                </div>),
        },
    ];
    const handleNext = async () => {
        if (currentStep === steps.length - 1) {
            // Save settings
            await saveSettings();
            onComplete();
        }
        else {
            setCurrentStep(currentStep + 1);
        }
    };
    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    const saveSettings = async () => {
        try {
            await window.wakey.setSetting('dailyFocusGoal', dailyGoal);
            await window.wakey.setSetting('autoStartTracking', autoTrack);
            if (groqApiKey) {
                await window.wakey.setSetting('groqApiKey', groqApiKey);
            }
            await window.wakey.setSetting('onboardingComplete', true);
        }
        catch (error) {
            console.error('Failed to save onboarding settings:', error);
        }
    };
    const currentStepData = steps[currentStep];
    return (<div className="fixed inset-0 bg-dark-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <currentStepData.icon className="w-5 h-5 text-primary-400"/>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{currentStepData.title}</h3>
                            <p className="text-sm text-dark-400">{currentStepData.description}</p>
                        </div>
                    </div>
                    <button onClick={onSkip} className="p-2 text-dark-400 hover:text-white transition-colors">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 min-h-[350px]">
                    {currentStepData.content}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700">
                    {/* Progress */}
                    <div className="flex items-center gap-2">
                        {steps.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentStep
                ? 'bg-primary-500'
                : i < currentStep
                    ? 'bg-primary-500/50'
                    : 'bg-dark-600'}`}/>))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-3">
                        {currentStep > 0 && (<button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 text-dark-400 hover:text-white transition-colors">
                                <ChevronLeft className="w-4 h-4"/>
                                Back
                            </button>)}
                        <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
                            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
                            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4"/>}
                        </button>
                    </div>
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=OnboardingWizard.js.map