import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Lock, Bell, Trash2, Check, Monitor, Globe, X, History, CheckCircle, XCircle, Activity, AlertTriangle, Shield, User, Settings as SettingsIcon, Key, Eye, EyeOff, Download, FileJson, FileSpreadsheet, Mail, Phone, Plus, Pencil, Smartphone, Copy, RefreshCw, Languages, Clock, Calendar, Accessibility, MousePointer, Type, Volume2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSound } from '@/components/effects/SoundEffects';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface LoginAttempt {
  id: string;
  timestamp: string;
  location: string;
  ip: string;
  browser: string;
  success: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  icon: 'password' | 'profile' | 'settings' | 'security' | 'login';
}

interface SecurityAlert {
  id: string;
  type: 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  dismissed: boolean;
}

const mockSessions: Session[] = [
  {
    id: '1',
    device: 'Windows 11 PC',
    browser: 'Chrome 120',
    location: 'San Francisco, CA',
    ip: '192.168.1.1',
    lastActive: 'Now',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'Windows 10 PC',
    browser: 'Firefox 121',
    location: 'New York, NY',
    ip: '10.0.0.5',
    lastActive: '1 day ago',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'Windows 11 PC',
    browser: 'Edge 120',
    location: 'London, UK',
    ip: '203.0.113.1',
    lastActive: '3 days ago',
    isCurrent: false,
  },
];

const mockLoginHistory: LoginAttempt[] = [
  {
    id: '1',
    timestamp: 'Jan 26, 2026 at 10:32 AM',
    location: 'San Francisco, CA',
    ip: '192.168.1.1',
    browser: 'Chrome 120',
    success: true,
  },
  {
    id: '2',
    timestamp: 'Jan 25, 2026 at 3:15 PM',
    location: 'New York, NY',
    ip: '10.0.0.5',
    browser: 'Firefox 121',
    success: true,
  },
  {
    id: '3',
    timestamp: 'Jan 24, 2026 at 8:45 AM',
    location: 'Unknown',
    ip: '45.33.32.156',
    browser: 'Chrome 119',
    success: false,
  },
  {
    id: '4',
    timestamp: 'Jan 23, 2026 at 11:20 AM',
    location: 'London, UK',
    ip: '203.0.113.1',
    browser: 'Edge 120',
    success: true,
  },
  {
    id: '5',
    timestamp: 'Jan 22, 2026 at 9:00 PM',
    location: 'Unknown',
    ip: '198.51.100.42',
    browser: 'Firefox 120',
    success: false,
  },
  {
    id: '6',
    timestamp: 'Jan 20, 2026 at 2:30 PM',
    location: 'San Francisco, CA',
    ip: '192.168.1.1',
    browser: 'Chrome 120',
    success: true,
  },
];

const mockActivityLog: ActivityLog[] = [
  {
    id: '1',
    action: 'Password Changed',
    description: 'Your account password was updated successfully',
    timestamp: 'Jan 26, 2026 at 9:15 AM',
    icon: 'password',
  },
  {
    id: '2',
    action: 'Profile Updated',
    description: 'Display name changed to "John Doe"',
    timestamp: 'Jan 25, 2026 at 4:30 PM',
    icon: 'profile',
  },
  {
    id: '3',
    action: 'Email Notifications Disabled',
    description: 'You turned off email notifications',
    timestamp: 'Jan 24, 2026 at 2:00 PM',
    icon: 'settings',
  },
  {
    id: '4',
    action: 'Session Revoked',
    description: 'Revoked session from Windows 10 PC in London, UK',
    timestamp: 'Jan 23, 2026 at 10:45 AM',
    icon: 'security',
  },
  {
    id: '5',
    action: 'Two-Factor Authentication',
    description: 'Backup codes were generated',
    timestamp: 'Jan 20, 2026 at 11:00 AM',
    icon: 'security',
  },
  {
    id: '6',
    action: 'Avatar Updated',
    description: 'Profile picture was changed',
    timestamp: 'Jan 18, 2026 at 3:20 PM',
    icon: 'profile',
  },
  {
    id: '7',
    action: 'Weekly Digest Enabled',
    description: 'You subscribed to weekly productivity reports',
    timestamp: 'Jan 15, 2026 at 9:00 AM',
    icon: 'settings',
  },
  {
    id: '8',
    action: 'Account Created',
    description: 'Welcome! Your account was created',
    timestamp: 'Jan 10, 2026 at 8:00 AM',
    icon: 'login',
  },
];

const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Failed login attempt from unknown location',
    description: 'Someone tried to access your account from Moscow, Russia (IP: 185.143.223.1) with incorrect credentials.',
    timestamp: 'Jan 24, 2026 at 8:45 AM',
    dismissed: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'New device sign-in detected',
    description: 'A new Windows device signed into your account from London, UK. If this wasn\'t you, secure your account immediately.',
    timestamp: 'Jan 23, 2026 at 11:20 AM',
    dismissed: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Multiple failed login attempts',
    description: '3 failed login attempts were detected from IP: 198.51.100.42. Your account was temporarily locked for 15 minutes.',
    timestamp: 'Jan 22, 2026 at 9:00 PM',
    dismissed: false,
  },
];

const Settings = () => {
  const { logout } = useAuth();
  const { playClick, playSuccess } = useSound();
  const navigate = useNavigate();
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  
  // Login notification preferences
  const [loginEmailAlerts, setLoginEmailAlerts] = useState(true);
  const [loginPushAlerts, setLoginPushAlerts] = useState(false);
  const [unknownDeviceAlerts, setUnknownDeviceAlerts] = useState(true);
  const [failedLoginAlerts, setFailedLoginAlerts] = useState(true);
  
  // Delete account state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  
  // Security alerts state
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(mockSecurityAlerts);
  
  // Data export state
  const [isExporting, setIsExporting] = useState<'json' | 'csv' | null>(null);

  // Recovery options state
  const [backupEmail, setBackupEmail] = useState('');
  const [backupPhone, setBackupPhone] = useState('');
  const [savedBackupEmail, setSavedBackupEmail] = useState<string | null>(null);
  const [savedBackupPhone, setSavedBackupPhone] = useState<string | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isSavingRecovery, setIsSavingRecovery] = useState<'email' | 'phone' | null>(null);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes] = useState([
    'WXYZ-1234-ABCD',
    'KLMN-5678-EFGH',
    'PQRS-9012-IJKL',
    'TUVW-3456-MNOP',
    'XYZA-7890-QRST',
    'BCDE-1357-UVWX',
    'FGHI-2468-YZAB',
    'JKLM-8024-CDEF',
  ]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Language & Region state
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');

  // Accessibility state
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(false);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Password strength calculation
  const calculatePasswordStrength = (password: string): { score: number; label: string; color: string; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;
    
    if (password.length === 0) {
      return { score: 0, label: '', color: '', feedback: [] };
    }
    
    // Length checks
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }
    
    if (password.length >= 12) {
      score += 1;
    }
    
    // Character type checks
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add lowercase letters');
    }
    
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add uppercase letters');
    }
    
    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add numbers');
    }
    
    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add special characters (!@#$%^&*)');
    }
    
    // Common patterns to avoid
    const commonPatterns = ['123456', 'password', 'qwerty', 'abc123'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      score = Math.max(0, score - 2);
      feedback.push('Avoid common patterns');
    }
    
    // Determine label and color based on score
    if (score <= 2) {
      return { score, label: 'Weak', color: 'bg-destructive', feedback };
    } else if (score <= 4) {
      return { score, label: 'Fair', color: 'bg-yellow-500', feedback };
    } else if (score <= 5) {
      return { score, label: 'Good', color: 'bg-primary', feedback };
    } else {
      return { score, label: 'Strong', color: 'bg-green-500', feedback: ['Excellent password!'] };
    }
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const getActivityIcon = (iconType: ActivityLog['icon']) => {
    switch (iconType) {
      case 'password':
        return <Key className="w-4 h-4" />;
      case 'profile':
        return <User className="w-4 h-4" />;
      case 'settings':
        return <SettingsIcon className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'login':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const handleDismissAlert = (alertId: string) => {
    playClick();
    setSecurityAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast.success('Alert dismissed');
  };

  const handleDismissAllAlerts = () => {
    playClick();
    setSecurityAlerts([]);
    toast.success('All alerts dismissed');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    playClick();
    setIsChangingPassword(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    playSuccess();
    toast.success('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
  };

  const handleEnable2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    playClick();
    setIsVerifying2FA(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIs2FAEnabled(true);
    setIs2FASetupOpen(false);
    setShowBackupCodes(true);
    setVerificationCode('');
    playSuccess();
    toast.success('Two-factor authentication enabled!');
    setIsVerifying2FA(false);
  };

  const handleDisable2FA = async () => {
    playClick();
    setIsVerifying2FA(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIs2FAEnabled(false);
    setShowBackupCodes(false);
    playSuccess();
    toast.success('Two-factor authentication disabled');
    setIsVerifying2FA(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyAllCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('All backup codes copied to clipboard');
  };

  const handleDownloadCodes = () => {
    const content = `Wakey Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleDateString()}

IMPORTANT: Keep these codes safe. Each code can only be used once.

${backupCodes.join('\n')}

If you lose access to your authenticator app, you can use these codes to sign in.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wakey-backup-codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Backup codes downloaded');
  };

  const handleDeleteAccount = async () => {
    playClick();
    setIsDeleting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    logout();
    toast.success('Account deleted successfully');
    navigate('/');
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    playClick();
    
    switch (key) {
      case 'email':
        setEmailNotifications(value);
        break;
      case 'push':
        setPushNotifications(value);
        break;
      case 'weekly':
        setWeeklyDigest(value);
        break;
      case 'updates':
        setProductUpdates(value);
        break;
    }
    
    toast.success('Notification preference updated');
  };

  const handleLoginNotificationChange = (key: string, value: boolean) => {
    playClick();
    
    switch (key) {
      case 'loginEmail':
        setLoginEmailAlerts(value);
        break;
      case 'loginPush':
        setLoginPushAlerts(value);
        break;
      case 'unknownDevice':
        setUnknownDeviceAlerts(value);
        break;
      case 'failedLogin':
        setFailedLoginAlerts(value);
        break;
    }
    
    toast.success('Login notification preference updated');
  };

  const handleLanguageRegionChange = (key: string, value: string) => {
    playClick();
    
    switch (key) {
      case 'language':
        setLanguage(value);
        break;
      case 'timezone':
        setTimezone(value);
        break;
      case 'dateFormat':
        setDateFormat(value);
        break;
      case 'timeFormat':
        setTimeFormat(value);
        break;
    }
    
    toast.success('Preference updated');
  };

  const handleAccessibilityChange = (key: string, value: boolean) => {
    playClick();
    
    switch (key) {
      case 'reduceMotion':
        setReduceMotion(value);
        break;
      case 'highContrast':
        setHighContrast(value);
        break;
      case 'largeText':
        setLargeText(value);
        break;
      case 'screenReader':
        setScreenReaderOptimized(value);
        break;
      case 'shortcuts':
        setKeyboardShortcuts(value);
        break;
      case 'sounds':
        setSoundEffects(value);
        break;
    }
    
    toast.success('Accessibility setting updated');
  };

  const handleRevokeSession = async (sessionId: string) => {
    playClick();
    setRevokingSessionId(sessionId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    playSuccess();
    toast.success('Session revoked successfully');
    setRevokingSessionId(null);
  };

  const handleRevokeAllSessions = async () => {
    playClick();
    setRevokingSessionId('all');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSessions(prev => prev.filter(s => s.isCurrent));
    playSuccess();
    toast.success('All other sessions revoked');
    setRevokingSessionId(null);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleSaveBackupEmail = async () => {
    if (!backupEmail.trim()) {
      toast.error('Please enter a backup email');
      return;
    }
    
    if (!validateEmail(backupEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    playClick();
    setIsSavingRecovery('email');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSavedBackupEmail(backupEmail.trim());
    setIsEditingEmail(false);
    playSuccess();
    toast.success('Backup email saved successfully');
    setIsSavingRecovery(null);
  };

  const handleSaveBackupPhone = async () => {
    if (!backupPhone.trim()) {
      toast.error('Please enter a backup phone number');
      return;
    }
    
    if (!validatePhone(backupPhone.trim())) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    playClick();
    setIsSavingRecovery('phone');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSavedBackupPhone(backupPhone.trim());
    setIsEditingPhone(false);
    playSuccess();
    toast.success('Backup phone saved successfully');
    setIsSavingRecovery(null);
  };

  const handleRemoveBackupEmail = async () => {
    playClick();
    setIsSavingRecovery('email');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSavedBackupEmail(null);
    setBackupEmail('');
    toast.success('Backup email removed');
    setIsSavingRecovery(null);
  };

  const handleRemoveBackupPhone = async () => {
    playClick();
    setIsSavingRecovery('phone');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSavedBackupPhone(null);
    setBackupPhone('');
    toast.success('Backup phone removed');
    setIsSavingRecovery(null);
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    playClick();
    setIsExporting(format);
    
    // Simulate data preparation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: {
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: 'Jan 10, 2026',
      },
      sessions: sessions.map(s => ({
        device: s.device,
        browser: s.browser,
        location: s.location,
        lastActive: s.lastActive,
      })),
      loginHistory: mockLoginHistory.map(l => ({
        timestamp: l.timestamp,
        location: l.location,
        browser: l.browser,
        success: l.success,
      })),
      activityLog: mockActivityLog.map(a => ({
        action: a.action,
        description: a.description,
        timestamp: a.timestamp,
      })),
      settings: {
        emailNotifications,
        pushNotifications,
        weeklyDigest,
        productUpdates,
      },
    };

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(exportData, null, 2);
      filename = 'wakey-account-data.json';
      mimeType = 'application/json';
    } else {
      // Convert to CSV format
      const csvRows: string[] = [];
      
      // Profile section
      csvRows.push('=== PROFILE ===');
      csvRows.push('Name,Email,Created At');
      csvRows.push(`"${exportData.profile.name}","${exportData.profile.email}","${exportData.profile.createdAt}"`);
      csvRows.push('');
      
      // Sessions section
      csvRows.push('=== ACTIVE SESSIONS ===');
      csvRows.push('Device,Browser,Location,Last Active');
      exportData.sessions.forEach(s => {
        csvRows.push(`"${s.device}","${s.browser}","${s.location}","${s.lastActive}"`);
      });
      csvRows.push('');
      
      // Login history section
      csvRows.push('=== LOGIN HISTORY ===');
      csvRows.push('Timestamp,Location,Browser,Success');
      exportData.loginHistory.forEach(l => {
        csvRows.push(`"${l.timestamp}","${l.location}","${l.browser}","${l.success}"`);
      });
      csvRows.push('');
      
      // Activity log section
      csvRows.push('=== ACTIVITY LOG ===');
      csvRows.push('Action,Description,Timestamp');
      exportData.activityLog.forEach(a => {
        csvRows.push(`"${a.action}","${a.description}","${a.timestamp}"`);
      });
      csvRows.push('');
      
      // Settings section
      csvRows.push('=== SETTINGS ===');
      csvRows.push('Setting,Value');
      csvRows.push(`"Email Notifications","${exportData.settings.emailNotifications}"`);
      csvRows.push(`"Push Notifications","${exportData.settings.pushNotifications}"`);
      csvRows.push(`"Weekly Digest","${exportData.settings.weeklyDigest}"`);
      csvRows.push(`"Product Updates","${exportData.settings.productUpdates}"`);
      
      content = csvRows.join('\n');
      filename = 'wakey-account-data.csv';
      mimeType = 'text/csv';
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    playSuccess();
    toast.success(`Data exported as ${format.toUpperCase()} successfully!`);
    setIsExporting(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 grain">
        <div className="container mx-auto px-6 py-12 max-w-2xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-2xl font-serif">Account Settings</h1>

            {/* Change Password Section */}
            <div className="premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Change Password</h2>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  {newPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2"
                    >
                      {/* Strength bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                            transition={{ duration: 0.3 }}
                            className={`h-full rounded-full ${passwordStrength.color}`}
                          />
                        </div>
                        <span className={`text-xs font-medium min-w-[50px] ${
                          passwordStrength.label === 'Weak' ? 'text-destructive' :
                          passwordStrength.label === 'Fair' ? 'text-yellow-500' :
                          passwordStrength.label === 'Good' ? 'text-primary' :
                          'text-green-500'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      
                      {/* Feedback items */}
                      {passwordStrength.feedback.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {passwordStrength.feedback.map((item, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                item === 'Excellent password!' 
                                  ? 'bg-green-500/10 text-green-600' 
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {item === 'Excellent password!' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <div className="w-1 h-1 rounded-full bg-current" />
                              )}
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg bg-background border focus:outline-none pr-12 ${
                        confirmPassword && confirmPassword !== newPassword 
                          ? 'border-destructive focus:border-destructive' 
                          : confirmPassword && confirmPassword === newPassword
                          ? 'border-green-500 focus:border-green-500'
                          : 'border-border focus:border-primary'
                      }`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-destructive mt-2 flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Passwords do not match
                    </motion.p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-green-500 mt-2 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Passwords match
                    </motion.p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Two-Factor Authentication</h2>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
              </div>

              {!is2FAEnabled && !is2FASetupOpen && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication adds an additional layer of security by requiring a code from your authenticator app when signing in.
                  </p>
                  <button
                    onClick={() => setIs2FASetupOpen(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    Enable 2FA
                  </button>
                </div>
              )}

              {is2FASetupOpen && !is2FAEnabled && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Install an authenticator app</p>
                        <p className="text-sm text-muted-foreground">
                          Download Google Authenticator, Authy, or Microsoft Authenticator on your phone.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Scan this QR code</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Open your authenticator app and scan the QR code below.
                        </p>
                        
                        {/* Simulated QR Code */}
                        <div className="inline-block p-4 bg-white rounded-lg">
                          <div className="w-40 h-40 relative">
                            {/* QR Code pattern simulation */}
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              {/* Corner squares */}
                              <rect x="5" y="5" width="25" height="25" fill="black" />
                              <rect x="8" y="8" width="19" height="19" fill="white" />
                              <rect x="11" y="11" width="13" height="13" fill="black" />
                              
                              <rect x="70" y="5" width="25" height="25" fill="black" />
                              <rect x="73" y="8" width="19" height="19" fill="white" />
                              <rect x="76" y="11" width="13" height="13" fill="black" />
                              
                              <rect x="5" y="70" width="25" height="25" fill="black" />
                              <rect x="8" y="73" width="19" height="19" fill="white" />
                              <rect x="11" y="76" width="13" height="13" fill="black" />
                              
                              {/* Random pattern for QR effect */}
                              <rect x="35" y="5" width="5" height="5" fill="black" />
                              <rect x="45" y="5" width="5" height="5" fill="black" />
                              <rect x="55" y="5" width="5" height="5" fill="black" />
                              <rect x="35" y="15" width="5" height="5" fill="black" />
                              <rect x="50" y="15" width="5" height="5" fill="black" />
                              <rect x="60" y="15" width="5" height="5" fill="black" />
                              <rect x="40" y="25" width="5" height="5" fill="black" />
                              <rect x="55" y="25" width="5" height="5" fill="black" />
                              
                              <rect x="5" y="35" width="5" height="5" fill="black" />
                              <rect x="15" y="35" width="5" height="5" fill="black" />
                              <rect x="25" y="35" width="5" height="5" fill="black" />
                              <rect x="5" y="45" width="5" height="5" fill="black" />
                              <rect x="20" y="45" width="5" height="5" fill="black" />
                              <rect x="5" y="55" width="5" height="5" fill="black" />
                              <rect x="15" y="55" width="5" height="5" fill="black" />
                              <rect x="25" y="55" width="5" height="5" fill="black" />
                              
                              <rect x="35" y="35" width="30" height="30" rx="4" fill="black" />
                              <rect x="40" y="40" width="20" height="20" rx="2" fill="white" />
                              <rect x="45" y="45" width="10" height="10" fill="black" />
                              
                              <rect x="70" y="35" width="5" height="5" fill="black" />
                              <rect x="80" y="35" width="5" height="5" fill="black" />
                              <rect x="90" y="35" width="5" height="5" fill="black" />
                              <rect x="75" y="45" width="5" height="5" fill="black" />
                              <rect x="85" y="45" width="5" height="5" fill="black" />
                              <rect x="70" y="55" width="5" height="5" fill="black" />
                              <rect x="80" y="55" width="5" height="5" fill="black" />
                              <rect x="90" y="55" width="5" height="5" fill="black" />
                              
                              <rect x="35" y="70" width="5" height="5" fill="black" />
                              <rect x="45" y="70" width="5" height="5" fill="black" />
                              <rect x="55" y="70" width="5" height="5" fill="black" />
                              <rect x="40" y="80" width="5" height="5" fill="black" />
                              <rect x="50" y="80" width="5" height="5" fill="black" />
                              <rect x="60" y="80" width="5" height="5" fill="black" />
                              <rect x="35" y="90" width="5" height="5" fill="black" />
                              <rect x="45" y="90" width="5" height="5" fill="black" />
                              <rect x="55" y="90" width="5" height="5" fill="black" />
                              
                              <rect x="70" y="70" width="5" height="5" fill="black" />
                              <rect x="80" y="70" width="5" height="5" fill="black" />
                              <rect x="75" y="80" width="5" height="5" fill="black" />
                              <rect x="85" y="80" width="5" height="5" fill="black" />
                              <rect x="90" y="80" width="5" height="5" fill="black" />
                              <rect x="70" y="90" width="5" height="5" fill="black" />
                              <rect x="80" y="90" width="5" height="5" fill="black" />
                              <rect x="90" y="90" width="5" height="5" fill="black" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 rounded-lg bg-muted">
                          <p className="text-xs text-muted-foreground mb-1">Can't scan? Enter this code manually:</p>
                          <code className="text-sm font-mono text-foreground">WAKEY-2FA-DEMO-SECRET-KEY</code>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Enter verification code</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Enter the 6-digit code from your authenticator app.
                        </p>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full max-w-[200px] px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-center text-lg font-mono tracking-widest"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleEnable2FA}
                      disabled={isVerifying2FA || verificationCode.length !== 6}
                      className="btn-primary flex items-center gap-2"
                    >
                      {isVerifying2FA ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Verify & Enable
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIs2FASetupOpen(false);
                        setVerificationCode('');
                      }}
                      className="px-4 py-2 text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {is2FAEnabled && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-primary">2FA is enabled</p>
                      <p className="text-sm text-muted-foreground">Your account is protected with two-factor authentication.</p>
                    </div>
                  </div>
                  
                  {showBackupCodes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Save your backup codes</AlertTitle>
                        <AlertDescription>
                          Keep these codes in a safe place. You'll need them if you lose access to your authenticator app.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((code) => (
                          <button
                            key={code}
                            onClick={() => handleCopyCode(code)}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted font-mono text-sm hover:bg-muted/80 transition-colors"
                          >
                            <span>{code}</span>
                            {copiedCode === code ? (
                              <Check className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyAllCodes}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          Copy all
                        </button>
                        <button
                          onClick={handleDownloadCodes}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                      
                      <button
                        onClick={() => setShowBackupCodes(false)}
                        className="text-sm text-primary hover:underline"
                      >
                        I've saved my backup codes
                      </button>
                    </motion.div>
                  )}
                  
                  {!showBackupCodes && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowBackupCodes(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View backup codes
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors text-sm">
                            <X className="w-4 h-4" />
                            Disable 2FA
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the extra security layer from your account. You'll only need your password to sign in.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDisable2FA}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isVerifying2FA ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : null}
                              Disable 2FA
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Preferences */}
            <div className="premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Notification Preferences</h2>
                  <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">Get a weekly summary of your productivity</p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={(checked) => handleNotificationChange('weekly', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Product Updates</p>
                    <p className="text-sm text-muted-foreground">Receive news about new features</p>
                  </div>
                  <Switch
                    checked={productUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('updates', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Login Notifications */}
            <div className="premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Login Notifications</h2>
                  <p className="text-sm text-muted-foreground">Get alerted about sign-in activity</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium">Email Login Alerts</p>
                    <p className="text-sm text-muted-foreground">Receive an email when someone signs in to your account</p>
                  </div>
                  <Switch
                    checked={loginEmailAlerts}
                    onCheckedChange={(checked) => handleLoginNotificationChange('loginEmail', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium">Push Login Alerts</p>
                    <p className="text-sm text-muted-foreground">Get push notifications for new sign-ins</p>
                  </div>
                  <Switch
                    checked={loginPushAlerts}
                    onCheckedChange={(checked) => handleLoginNotificationChange('loginPush', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium">Unknown Device Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when a new device signs in</p>
                  </div>
                  <Switch
                    checked={unknownDeviceAlerts}
                    onCheckedChange={(checked) => handleLoginNotificationChange('unknownDevice', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Failed Login Alerts</p>
                    <p className="text-sm text-muted-foreground">Get alerted about failed sign-in attempts</p>
                  </div>
                  <Switch
                    checked={failedLoginAlerts}
                    onCheckedChange={(checked) => handleLoginNotificationChange('failedLogin', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Language & Region */}
            <div className="premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Languages className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Language & Region</h2>
                  <p className="text-sm text-muted-foreground">Set your preferred language and regional formats</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Language</p>
                      <p className="text-sm text-muted-foreground">Select your preferred language</p>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageRegionChange('language', e.target.value)}
                    className="px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="pt">Português</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                    <option value="ko">한국어</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Timezone</p>
                      <p className="text-sm text-muted-foreground">Your local timezone for scheduling</p>
                    </div>
                  </div>
                  <select
                    value={timezone}
                    onChange={(e) => handleLanguageRegionChange('timezone', e.target.value)}
                    className="px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm"
                  >
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Australia/Sydney">Sydney (AEST)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date Format</p>
                      <p className="text-sm text-muted-foreground">How dates are displayed</p>
                    </div>
                  </div>
                  <select
                    value={dateFormat}
                    onChange={(e) => handleLanguageRegionChange('dateFormat', e.target.value)}
                    className="px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Time Format</p>
                      <p className="text-sm text-muted-foreground">12-hour or 24-hour clock</p>
                    </div>
                  </div>
                  <select
                    value={timeFormat}
                    onChange={(e) => handleLanguageRegionChange('timeFormat', e.target.value)}
                    className="px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm"
                  >
                    <option value="12h">12-hour (1:30 PM)</option>
                    <option value="24h">24-hour (13:30)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Accessibility */}
            <div className="premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Accessibility className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Accessibility</h2>
                  <p className="text-sm text-muted-foreground">Customize your experience for better accessibility</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <MousePointer className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Reduce Motion</p>
                      <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                    </div>
                  </div>
                  <Switch
                    checked={reduceMotion}
                    onCheckedChange={(checked) => handleAccessibilityChange('reduceMotion', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">High Contrast</p>
                      <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                    </div>
                  </div>
                  <Switch
                    checked={highContrast}
                    onCheckedChange={(checked) => handleAccessibilityChange('highContrast', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Large Text</p>
                      <p className="text-sm text-muted-foreground">Increase default text size</p>
                    </div>
                  </div>
                  <Switch
                    checked={largeText}
                    onCheckedChange={(checked) => handleAccessibilityChange('largeText', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Screen Reader Optimized</p>
                      <p className="text-sm text-muted-foreground">Optimize layout for screen readers</p>
                    </div>
                  </div>
                  <Switch
                    checked={screenReaderOptimized}
                    onCheckedChange={(checked) => handleAccessibilityChange('screenReader', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Keyboard Shortcuts</p>
                      <p className="text-sm text-muted-foreground">Enable keyboard navigation shortcuts</p>
                    </div>
                  </div>
                  <Switch
                    checked={keyboardShortcuts}
                    onCheckedChange={(checked) => handleAccessibilityChange('shortcuts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Sound Effects</p>
                      <p className="text-sm text-muted-foreground">Play audio feedback for actions</p>
                    </div>
                  </div>
                  <Switch
                    checked={soundEffects}
                    onCheckedChange={(checked) => handleAccessibilityChange('sounds', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Account Recovery Options */}
            <div className="premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Account Recovery</h2>
                  <p className="text-sm text-muted-foreground">Set up backup options to recover your account</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Backup Email */}
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Backup Email</p>
                        <p className="text-sm text-muted-foreground">
                          {savedBackupEmail 
                            ? 'Used to recover your account if you lose access'
                            : 'Add a secondary email for account recovery'
                          }
                        </p>
                      </div>
                    </div>
                    {!isEditingEmail && (
                      <div className="flex items-center gap-2">
                        {savedBackupEmail ? (
                          <>
                            <button
                              onClick={() => {
                                setBackupEmail(savedBackupEmail);
                                setIsEditingEmail(true);
                              }}
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Edit backup email"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleRemoveBackupEmail}
                              disabled={isSavingRecovery === 'email'}
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                              title="Remove backup email"
                            >
                              {isSavingRecovery === 'email' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsEditingEmail(true)}
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {savedBackupEmail && !isEditingEmail && (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                      <span className="text-sm text-muted-foreground">{savedBackupEmail}</span>
                    </div>
                  )}
                  
                  {isEditingEmail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      <input
                        type="email"
                        value={backupEmail}
                        onChange={(e) => setBackupEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                        placeholder="backup@example.com"
                        maxLength={255}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveBackupEmail}
                          disabled={isSavingRecovery === 'email'}
                          className="btn-primary text-sm py-2 flex items-center gap-2"
                        >
                          {isSavingRecovery === 'email' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingEmail(false);
                            setBackupEmail(savedBackupEmail || '');
                          }}
                          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Backup Phone */}
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Backup Phone</p>
                        <p className="text-sm text-muted-foreground">
                          {savedBackupPhone 
                            ? 'Receive SMS codes for account recovery'
                            : 'Add a phone number for SMS recovery codes'
                          }
                        </p>
                      </div>
                    </div>
                    {!isEditingPhone && (
                      <div className="flex items-center gap-2">
                        {savedBackupPhone ? (
                          <>
                            <button
                              onClick={() => {
                                setBackupPhone(savedBackupPhone);
                                setIsEditingPhone(true);
                              }}
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Edit backup phone"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleRemoveBackupPhone}
                              disabled={isSavingRecovery === 'phone'}
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                              title="Remove backup phone"
                            >
                              {isSavingRecovery === 'phone' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsEditingPhone(true)}
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {savedBackupPhone && !isEditingPhone && (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                      <span className="text-sm text-muted-foreground">{savedBackupPhone}</span>
                    </div>
                  )}
                  
                  {isEditingPhone && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      <input
                        type="tel"
                        value={backupPhone}
                        onChange={(e) => setBackupPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                        placeholder="+1 (555) 123-4567"
                        maxLength={20}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveBackupPhone}
                          disabled={isSavingRecovery === 'phone'}
                          className="btn-primary text-sm py-2 flex items-center gap-2"
                        >
                          {isSavingRecovery === 'phone' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPhone(false);
                            setBackupPhone(savedBackupPhone || '');
                          }}
                          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Recovery options help you regain access if you forget your password or lose your primary email.
              </p>
            </div>

            {/* Active Sessions */}
            <div className="premium-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Active Sessions</h2>
                    <p className="text-sm text-muted-foreground">Manage your logged in devices</p>
                  </div>
                </div>
                {sessions.filter(s => !s.isCurrent).length > 0 && (
                  <button
                    onClick={handleRevokeAllSessions}
                    disabled={revokingSessionId !== null}
                    className="text-sm text-destructive hover:underline disabled:opacity-50"
                  >
                    {revokingSessionId === 'all' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Revoke all other sessions'
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{session.device}</p>
                          {session.isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.browser} • {session.location}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          IP: {session.ip} • Last active: {session.lastActive}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revokingSessionId !== null}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                        title="Revoke session"
                      >
                        {revokingSessionId === session.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <X className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              {sessions.length === 1 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  This is your only active session.
                </p>
              )}
            </div>

            {/* Login History */}
            <div className="premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Login History</h2>
                  <p className="text-sm text-muted-foreground">Recent sign-in attempts to your account</p>
                </div>
              </div>

              <div className="space-y-3">
                {mockLoginHistory.map((attempt) => (
                  <div
                    key={attempt.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      attempt.success 
                        ? 'bg-background border-border' 
                        : 'bg-destructive/5 border-destructive/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        attempt.success ? 'bg-primary/10' : 'bg-destructive/10'
                      }`}>
                        {attempt.success ? (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {attempt.success ? 'Successful login' : 'Failed login attempt'}
                          </p>
                          {!attempt.success && (
                            <Badge variant="destructive" className="text-xs">
                              Failed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {attempt.browser} • {attempt.location}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          IP: {attempt.ip}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{attempt.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Showing the last 6 login attempts. Suspicious activity? Change your password immediately.
              </p>
            </div>

            {/* Security Alerts */}
            <div className="premium-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Security Alerts</h2>
                    <p className="text-sm text-muted-foreground">Suspicious activity notifications</p>
                  </div>
                </div>
                {securityAlerts.length > 0 && (
                  <button
                    onClick={handleDismissAllAlerts}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Dismiss all
                  </button>
                )}
              </div>

              <AnimatePresence mode="popLayout">
                {securityAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {securityAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Alert
                          variant={alert.type === 'critical' ? 'destructive' : 'default'}
                          className={`relative ${
                            alert.type === 'critical' 
                              ? 'border-destructive/50 bg-destructive/5' 
                              : 'border-yellow-500/50 bg-yellow-500/5'
                          }`}
                        >
                          {alert.type === 'critical' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                          <AlertTitle className="flex items-center justify-between pr-8">
                            <span>{alert.title}</span>
                            <Badge 
                              variant={alert.type === 'critical' ? 'destructive' : 'secondary'}
                              className={alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' : ''}
                            >
                              {alert.type === 'critical' ? 'Critical' : 'Warning'}
                            </Badge>
                          </AlertTitle>
                          <AlertDescription className="mt-2">
                            <p>{alert.description}</p>
                            <p className="text-xs mt-2 opacity-70">{alert.timestamp}</p>
                          </AlertDescription>
                          <button
                            onClick={() => handleDismissAlert(alert.id)}
                            className="absolute top-3 right-3 p-1 rounded hover:bg-muted transition-colors"
                            title="Dismiss alert"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </Alert>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No security alerts</p>
                    <p className="text-sm">Your account looks secure!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account Activity Log */}
            <div className="premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Account Activity</h2>
                  <p className="text-sm text-muted-foreground">Recent actions on your account</p>
                </div>
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                
                <div className="space-y-4">
                  {mockActivityLog.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative flex items-start gap-4 pl-10"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-3 w-4 h-4 rounded-full border-2 bg-background ${
                        activity.icon === 'security' 
                          ? 'border-destructive' 
                          : activity.icon === 'password'
                          ? 'border-yellow-500'
                          : 'border-primary'
                      }`}>
                        <div className={`w-2 h-2 rounded-full m-0.5 ${
                          activity.icon === 'security' 
                            ? 'bg-destructive' 
                            : activity.icon === 'password'
                            ? 'bg-yellow-500'
                            : 'bg-primary'
                        }`} />
                      </div>
                      
                      <div className="flex-1 flex items-start justify-between gap-4 pb-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            activity.icon === 'security' 
                              ? 'bg-destructive/10 text-destructive' 
                              : activity.icon === 'password'
                              ? 'bg-yellow-500/10 text-yellow-600'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {getActivityIcon(activity.icon)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {activity.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border text-center">
                <button className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  View full activity log
                </button>
              </div>
            </div>

            {/* Data Export */}
            <div className="premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Export Your Data</h2>
                  <p className="text-sm text-muted-foreground">Download a copy of all your account data</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Export your profile information, activity history, login records, and settings. Choose your preferred format below.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleExportData('json')}
                  disabled={isExporting !== null}
                  className="flex items-center justify-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  {isExporting === 'json' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <FileJson className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">JSON Format</p>
                        <p className="text-xs text-muted-foreground">Structured data file</p>
                      </div>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleExportData('csv')}
                  disabled={isExporting !== null}
                  className="flex items-center justify-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  {isExporting === 'csv' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <FileSpreadsheet className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">CSV Format</p>
                        <p className="text-xs text-muted-foreground">Spreadsheet compatible</p>
                      </div>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Your export will include: Profile, Sessions, Login History, Activity Log, and Settings
              </p>
            </div>

            {/* Delete Account */}
            <div className="premium-card border-destructive/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-destructive">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground">Irreversible account actions</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors">
                    Delete Account
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
                      <div className="pt-2">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-destructive">DELETE</span> to confirm
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:border-destructive focus:outline-none"
                          placeholder="Type DELETE here"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
