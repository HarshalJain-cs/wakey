# Wakey - User Inputs & Configuration Required

This document lists all the inputs, API keys, and configuration values needed to set up Wakey for production.

---

## 1. Required Inputs

### GitHub Configuration
| Input | Description | Where to Get |
|-------|-------------|--------------|
| **GitHub Username** | Your GitHub username for releases | github.com/settings/profile |
| **GitHub Repository** | Repository name (e.g., `wakey`) | Create at github.com/new |
| **GitHub Personal Access Token** | Token with `repo` scope for publishing releases | github.com/settings/tokens |

### Supabase Configuration (for Authentication & Cloud Sync)
| Input | Description | Where to Get |
|-------|-------------|--------------|
| **Supabase Project URL** | Your Supabase project URL | supabase.com/dashboard > Project Settings > API |
| **Supabase Anon Key** | Public anonymous key | supabase.com/dashboard > Project Settings > API |
| **Supabase Service Role Key** | Admin key (keep secret, for server only) | supabase.com/dashboard > Project Settings > API |

### AI API Keys (Optional - for AI features)
| Input | Description | Where to Get | Cost |
|-------|-------------|--------------|------|
| **Groq API Key** | Primary AI provider | console.groq.com | Free |
| **OpenAI API Key** | For GPT models (optional) | platform.openai.com/api-keys | Paid |
| **Anthropic API Key** | For Claude models (optional) | console.anthropic.com | Paid |

---

## 2. Supabase Setup Instructions

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Project name**: `wakey`
   - **Database password**: (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"

### Step 2: Get API Keys
1. Go to Project Settings > API
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Enable Authentication
1. Go to Authentication > Providers
2. Enable:
   - **Email** (enabled by default)
   - **Google** (optional, requires Google OAuth setup)
   - **GitHub** (optional, requires GitHub OAuth app)

### Step 4: Create Database Tables
Run this SQL in Supabase SQL Editor:

```sql
-- User profiles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User data sync
CREATE TABLE public.user_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    data JSONB NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view own data"
    ON public.user_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
    ON public.user_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
    ON public.user_data FOR UPDATE
    USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 3. GitHub Repository Setup

### Step 1: Create Repository
1. Go to github.com/new
2. Repository name: `wakey`
3. Description: "AI-Native Productivity Tracker"
4. Make it **Public** (for GitHub Releases download links)
5. Initialize with README

### Step 2: Create Personal Access Token
1. Go to github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `wakey-publish`
4. Select scopes: `repo` (all), `workflow`
5. Click "Generate token"
6. **Save the token** - you'll need it for publishing

### Step 3: Add Token to Environment
Create a `.env` file in the desktop app folder:
```env
GH_TOKEN=your_github_personal_access_token
```

---

## 4. Configuration in App

Users will need to enter these values in Wakey Settings:

### Required for Authentication
- **Supabase URL**: `https://xxxxx.supabase.co`
- **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Required for AI Features
- **Groq API Key**: `gsk_...` (Get free at console.groq.com)

---

## 5. App Store Distribution (Future)

### For Code Signing (removes Windows warnings)
| Input | Description | Cost |
|-------|-------------|------|
| **Code Signing Certificate** | From trusted CA (Sectigo, DigiCert, etc.) | ~$70-300/year |

### For Microsoft Store
| Input | Description |
|-------|-------------|
| **Microsoft Partner Account** | partner.microsoft.com |
| **App submission details** | Icons, screenshots, description |

---

## 6. Domain & Website (Optional)

### For Custom Domain
| Input | Description |
|-------|-------------|
| **Domain name** | e.g., `wakey.app` |
| **DNS configuration** | Point to GitHub Pages |

### GitHub Pages Setup
1. Go to Repository > Settings > Pages
2. Source: Deploy from branch
3. Branch: `main` / `docs` folder
4. Custom domain: Enter your domain (optional)

---

## 7. Environment Variables Summary

### Development (.env)
```env
# GitHub (for publishing releases)
GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Supabase (for development testing)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI APIs (optional)
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
```

### Production (in app settings)
Users enter these in the Settings page:
- Supabase URL
- Supabase Anon Key
- Groq API Key

---

## 8. Checklist Before Launch

- [ ] GitHub repository created
- [ ] GitHub personal access token generated
- [ ] Supabase project created
- [ ] Supabase tables created (run SQL)
- [ ] Supabase API keys obtained
- [ ] Groq API key obtained (free)
- [ ] Landing page updated with your GitHub username
- [ ] App built and tested
- [ ] First release published to GitHub Releases
- [ ] Download links tested

---

## Need Help?

1. **Supabase issues**: Check [supabase.com/docs](https://supabase.com/docs)
2. **GitHub releases**: Check [electron-builder docs](https://www.electron.build/configuration/publish)
3. **General questions**: Open an issue on GitHub
