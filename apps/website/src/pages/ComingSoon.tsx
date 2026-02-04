import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, Clock, Bell, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';

export default function ComingSoon() {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);

        // Simulate API call - in production, save to database
        await new Promise(resolve => setTimeout(resolve, 1500));

        // TODO: Save email to Supabase waitlist table
        console.log('Email submitted:', email);

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    return (
        <div className="grain min-h-screen">
            <SEO
                title="Coming Soon - Wakey"
                description="Something amazing is cooking. Be the first to know when Wakey Free launches."
            />
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-lg mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="premium-card text-center"
                    >
                        {/* Cooking Animation */}
                        <motion.div
                            className="mb-8"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                                <Sparkles className="w-12 h-12 text-white" />
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl md:text-4xl font-serif mb-4"
                        >
                            Something Amazing is{' '}
                            <span className="gradient-text">Cooking</span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-muted-foreground text-lg mb-8 flex items-center justify-center gap-2"
                        >
                            <Clock className="w-5 h-5 text-primary" />
                            Wait for it...
                        </motion.p>

                        {/* Conditional Content */}
                        {user ? (
                            // Logged in user
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-primary/10 border border-primary/20 rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <Bell className="w-6 h-6 text-primary" />
                                    <span className="text-primary font-semibold text-lg">You're on the list!</span>
                                </div>
                                <p className="text-foreground">
                                    We'll notify you at{' '}
                                    <span className="font-medium bg-muted px-3 py-1 rounded-lg">
                                        {user.email}
                                    </span>
                                </p>
                                <p className="text-muted-foreground text-sm mt-4">
                                    when the Wakey Free plan is ready.
                                </p>
                            </motion.div>
                        ) : isSubmitted ? (
                            // Email submitted successfully
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-primary/10 border border-primary/20 rounded-2xl p-6"
                            >
                                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                                <p className="text-primary font-semibold text-lg mb-2">You're on the waitlist!</p>
                                <p className="text-muted-foreground">
                                    We'll email you when Wakey Free is ready.
                                </p>
                            </motion.div>
                        ) : (
                            // Not logged in - show email form
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <p className="text-muted-foreground mb-6">
                                    Be the first to know when Wakey Free launches!
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="w-full bg-muted/50 border border-border rounded-xl py-4 pl-12 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Joining...
                                            </>
                                        ) : (
                                            <>
                                                <Bell className="w-5 h-5" />
                                                Notify Me
                                            </>
                                        )}
                                    </button>
                                </form>

                                <p className="text-muted-foreground text-sm mt-4">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-primary hover:underline transition-colors">
                                        Sign in
                                    </Link>
                                </p>
                            </motion.div>
                        )}

                        {/* Back to home */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8"
                        >
                            <Link
                                to="/"
                                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                            >
                                ← Back to Home
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
