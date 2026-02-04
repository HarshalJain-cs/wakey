import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useSound } from '@/components/effects/SoundEffects';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import SEO from '@/components/SEO';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { playClick, playSuccess } = useSound();
  const { signup } = useAuth();

  const passwordStrength = {
    hasLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
  const isValid = passwordStrength.hasLength && passwordStrength.hasUppercase && passwordStrength.hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    playClick();
    setIsLoading(true);

    const result = await signup(name, email, password);

    if (result.success) {
      playSuccess();
      if (result.requiresVerification) {
        toast.success('Account created! Please verify your email.');
        navigate('/verify-email', { state: { email } });
      } else {
        toast.success('Account created! Welcome to Wakey.');
        navigate('/dashboard', { replace: true });
      }
    } else {
      toast.error(result.error || 'Failed to create account. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="grain min-h-screen flex items-center justify-center px-6 py-12">
      <SEO 
        title="Sign Up" 
        description="Create your free Wakey account and start your 14-day trial. Boost your productivity with AI-powered insights."
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)' }}
          >
            <span className="text-2xl font-serif text-white">W</span>
          </div>
          <span className="text-2xl font-serif text-foreground">Wakey</span>
        </Link>

        <div className="premium-card">
          <h1 className="text-2xl font-serif text-center mb-2">Create an account</h1>
          <p className="text-muted-foreground text-center mb-8">Start your 14-day free trial</p>

          <SocialLoginButtons mode="signup" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-3 space-y-1">
                {[
                  { key: 'hasLength', label: 'At least 8 characters' },
                  { key: 'hasUppercase', label: 'One uppercase letter' },
                  { key: 'hasNumber', label: 'One number' },
                ].map((req) => (
                  <div
                    key={req.key}
                    className={`flex items-center gap-2 text-xs ${
                      passwordStrength[req.key as keyof typeof passwordStrength]
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    {req.label}
                  </div>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
