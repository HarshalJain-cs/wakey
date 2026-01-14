// Supabase Authentication Service
// Handles user authentication with Supabase

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// ==========================================
// Types
// ==========================================

export interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    error: string | null;
}

export interface SignUpData {
    email: string;
    password: string;
    confirmPassword?: string;
}

export interface SignInData {
    email: string;
    password: string;
}

// ==========================================
// State
// ==========================================

let supabase: SupabaseClient | null = null;
let currentState: AuthState = {
    user: null,
    session: null,
    isLoading: true,
    error: null,
};

const listeners: Set<(state: AuthState) => void> = new Set();

// ==========================================
// Initialization
// ==========================================

export async function initSupabase(): Promise<boolean> {
    try {
        const settings = await window.wakey.getSettings();
        const supabaseUrl = settings.supabaseUrl as string;
        const supabaseKey = settings.supabaseAnonKey as string;

        if (!supabaseUrl || !supabaseKey) {
            updateState({ isLoading: false, error: 'Supabase not configured' });
            return false;
        }

        supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                storage: {
                    getItem: async (key) => {
                        const settings = await window.wakey.getSettings();
                        return (settings[key] as string) || null;
                    },
                    setItem: async (key, value) => {
                        await window.wakey.setSetting(key, value);
                    },
                    removeItem: async (key) => {
                        await window.wakey.setSetting(key, null);
                    },
                },
            },
        });

        // Listen for auth state changes
        supabase.auth.onAuthStateChange((_event, session) => {
            updateState({
                user: session?.user || null,
                session,
                isLoading: false,
                error: null,
            });
        });

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            updateState({ isLoading: false, error: error.message });
            return false;
        }

        updateState({
            user: session?.user || null,
            session,
            isLoading: false,
        });

        return !!session;
    } catch (error) {
        updateState({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to initialize Supabase',
        });
        return false;
    }
}

// ==========================================
// Authentication Methods
// ==========================================

export async function signUp({ email, password, confirmPassword }: SignUpData): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    if (confirmPassword && password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
    }

    if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    updateState({ isLoading: true, error: null });

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            updateState({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }

        if (data.user && !data.session) {
            // Email confirmation required
            updateState({ isLoading: false });
            return {
                success: true,
                error: 'Please check your email to confirm your account'
            };
        }

        updateState({
            user: data.user,
            session: data.session,
            isLoading: false,
        });

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Sign up failed';
        updateState({ isLoading: false, error: message });
        return { success: false, error: message };
    }
}

export async function signIn({ email, password }: SignInData): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    updateState({ isLoading: true, error: null });

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            updateState({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }

        updateState({
            user: data.user,
            session: data.session,
            isLoading: false,
        });

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Sign in failed';
        updateState({ isLoading: false, error: message });
        return { success: false, error: message };
    }
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return { success: false, error: error.message };
        }

        updateState({
            user: null,
            session: null,
            isLoading: false,
            error: null,
        });

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Sign out failed';
        return { success: false, error: message };
    }
}

export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'wakey://reset-password',
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Password reset failed';
        return { success: false, error: message };
    }
}

// ==========================================
// OAuth Providers
// ==========================================

export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'wakey://auth-callback',
            },
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Google sign in failed';
        return { success: false, error: message };
    }
}

export async function signInWithGitHub(): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: 'wakey://auth-callback',
            },
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'GitHub sign in failed';
        return { success: false, error: message };
    }
}

// ==========================================
// State Management
// ==========================================

function updateState(partial: Partial<AuthState>): void {
    currentState = { ...currentState, ...partial };
    listeners.forEach(listener => listener(currentState));
}

export function getAuthState(): AuthState {
    return { ...currentState };
}

export function subscribe(listener: (state: AuthState) => void): () => void {
    listeners.add(listener);
    listener(currentState); // Call immediately with current state
    return () => listeners.delete(listener);
}

export function isAuthenticated(): boolean {
    return !!currentState.session && !!currentState.user;
}

export function getUser(): User | null {
    return currentState.user;
}

export function getSession(): Session | null {
    return currentState.session;
}

// ==========================================
// Supabase Client Access
// ==========================================

export function getSupabaseClient(): SupabaseClient | null {
    return supabase;
}
