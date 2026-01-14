import { useState } from 'react';
import {
    Mail, Lock, Eye, EyeOff, AlertCircle,
    Loader2, Github, ArrowRight
} from 'lucide-react';
import * as auth from '../services/supabase-auth';

interface AuthPageProps {
    onAuthSuccess: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            if (mode === 'signup') {
                const result = await auth.signUp({ email, password, confirmPassword });
                if (result.success) {
                    if (result.error?.includes('check your email')) {
                        setSuccessMessage(result.error);
                        setMode('signin');
                    } else {
                        onAuthSuccess();
                    }
                } else {
                    setError(result.error || 'Sign up failed');
                }
            } else if (mode === 'signin') {
                const result = await auth.signIn({ email, password });
                if (result.success) {
                    onAuthSuccess();
                } else {
                    setError(result.error || 'Sign in failed');
                }
            } else if (mode === 'forgot') {
                const result = await auth.resetPassword(email);
                if (result.success) {
                    setSuccessMessage('Password reset email sent. Check your inbox.');
                    setMode('signin');
                } else {
                    setError(result.error || 'Password reset failed');
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const result = await auth.signInWithGoogle();
        if (!result.success) {
            setError(result.error || 'Google sign in failed');
        }
        setIsLoading(false);
    };

    const handleGitHubSignIn = async () => {
        setIsLoading(true);
        const result = await auth.signInWithGitHub();
        if (!result.success) {
            setError(result.error || 'GitHub sign in failed');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-2xl mb-4">
                        <span className="text-3xl">W</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Wakey</h1>
                    <p className="text-dark-400 mt-2">AI-Native Productivity Tracker</p>
                </div>

                {/* Auth Card */}
                <div className="bg-dark-800 rounded-2xl border border-dark-700 p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-white">
                            {mode === 'signin' && 'Welcome Back'}
                            {mode === 'signup' && 'Create Account'}
                            {mode === 'forgot' && 'Reset Password'}
                        </h2>
                        <p className="text-dark-400 text-sm mt-1">
                            {mode === 'signin' && 'Sign in to continue to Wakey'}
                            {mode === 'signup' && 'Start tracking your productivity'}
                            {mode === 'forgot' && 'Enter your email to reset password'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg mb-4 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg mb-4 text-green-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {successMessage}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        {mode !== 'forgot' && (
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        minLength={6}
                                        className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-12 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Confirm Password (Sign Up only) */}
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your password"
                                        required
                                        minLength={6}
                                        className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Forgot Password Link */}
                        {mode === 'signin' && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setMode('forgot')}
                                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {mode === 'signin' && 'Sign In'}
                                    {mode === 'signup' && 'Create Account'}
                                    {mode === 'forgot' && 'Send Reset Link'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    {mode !== 'forgot' && (
                        <>
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-dark-600" />
                                <span className="text-dark-500 text-sm">or continue with</span>
                                <div className="flex-1 h-px bg-dark-600" />
                            </div>

                            {/* OAuth Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-2 py-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-white transition-colors disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Google
                                </button>
                                <button
                                    onClick={handleGitHubSignIn}
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-2 py-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-white transition-colors disabled:opacity-50"
                                >
                                    <Github className="w-5 h-5" />
                                    GitHub
                                </button>
                            </div>
                        </>
                    )}

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center text-sm">
                        {mode === 'signin' && (
                            <p className="text-dark-400">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => { setMode('signup'); setError(null); }}
                                    className="text-primary-400 hover:text-primary-300 font-medium"
                                >
                                    Sign up
                                </button>
                            </p>
                        )}
                        {mode === 'signup' && (
                            <p className="text-dark-400">
                                Already have an account?{' '}
                                <button
                                    onClick={() => { setMode('signin'); setError(null); }}
                                    className="text-primary-400 hover:text-primary-300 font-medium"
                                >
                                    Sign in
                                </button>
                            </p>
                        )}
                        {mode === 'forgot' && (
                            <button
                                onClick={() => { setMode('signin'); setError(null); }}
                                className="text-primary-400 hover:text-primary-300 font-medium"
                            >
                                Back to sign in
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-dark-500 text-sm mt-6">
                    By continuing, you agree to Wakey's Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
