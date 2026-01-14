# Wakey - Production Implementation Plan

**Complete Step-by-Step Guide to Launch Wakey as a Production-Ready Windows Application**

---

## Phase 1: Pre-Launch Setup

### Step 1.1: Create GitHub Repository
```bash
# Initialize git (if not done)
cd wakey
git init
git add .
git commit -m "Initial commit - Wakey v0.1.0"

# Create repository on GitHub (github.com/new)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/wakey.git
git branch -M main
git push -u origin main
```

### Step 1.2: Create GitHub Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `wakey-releases`
4. Select scopes:
   - [x] `repo` (all sub-items)
   - [x] `workflow`
5. Click "Generate token"
6. **Copy and save the token securely**

### Step 1.3: Set Up Environment Variables
Create `.env` file in `apps/desktop/`:
```env
GH_TOKEN=ghp_your_github_token_here
```

---

## Phase 2: Supabase Configuration

### Step 2.1: Create Supabase Project
1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Configure:
   - Name: `wakey-prod`
   - Database Password: [Create strong password]
   - Region: [Choose closest]
5. Wait for project to be ready (~2 minutes)

### Step 2.2: Get API Keys
1. Go to Project Settings > API
2. Copy and save:
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon public key**: `eyJ...`
   - **service_role key**: `eyJ...` (keep secret!)

### Step 2.3: Set Up Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Run this SQL:

```sql
-- User profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User data sync table
CREATE TABLE public.user_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    data_type TEXT NOT NULL,
    data JSONB NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_data_user_id ON public.user_data(user_id);
CREATE INDEX idx_user_data_type ON public.user_data(data_type);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- RLS Policies for user_data
CREATE POLICY "Users can view own data"
    ON public.user_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
    ON public.user_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
    ON public.user_data FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
    ON public.user_data FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (new.id, new.email, split_part(new.email, '@', 1));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 2.4: Configure Authentication
1. Go to Authentication > Providers
2. Email/Password is enabled by default
3. (Optional) Enable Google OAuth:
   - Get credentials from Google Cloud Console
   - Add Client ID and Secret

---

## Phase 3: Build Configuration

### Step 3.1: Update Package.json with Your Info
Edit `apps/desktop/package.json`:
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "YOUR_GITHUB_USERNAME",
      "repo": "wakey"
    }
  }
}
```

### Step 3.2: Update Landing Page
Edit `docs/index.html`:
- Replace `YOUR_USERNAME` with your GitHub username
- Update download links

### Step 3.3: Create App Icon
Required sizes for Windows:
- `resources/icon.png` - 256x256 pixels minimum
- Should be a square PNG with transparent background

---

## Phase 4: Build Production Release

### Step 4.1: Clean Previous Builds
```bash
cd wakey
pnpm clean
```

### Step 4.2: Install Dependencies
```bash
pnpm install
```

### Step 4.3: Build Application
```bash
cd apps/desktop
pnpm build
```

### Step 4.4: Package for Windows
```bash
pnpm package:win
```

Output will be in `apps/desktop/release/`:
- `Wakey-0.1.0-x64.exe` - Windows installer
- `Wakey-0.1.0-Portable.exe` - Portable version

---

## Phase 5: Publish Release

### Step 5.1: Test Locally First
1. Run the portable version
2. Test all features
3. Test with Supabase credentials

### Step 5.2: Publish to GitHub Releases
```bash
# Set environment variable
export GH_TOKEN=your_github_token

# Publish
cd apps/desktop
pnpm package:win --publish always
```

This will:
1. Build the app
2. Create installers
3. Upload to GitHub Releases
4. Create a new release draft

### Step 5.3: Finalize Release
1. Go to GitHub > Releases
2. Edit the draft release
3. Add release notes
4. Click "Publish release"

---

## Phase 6: Set Up Landing Page (GitHub Pages)

### Step 6.1: Enable GitHub Pages
1. Go to Repository > Settings > Pages
2. Source: "Deploy from a branch"
3. Branch: `main`
4. Folder: `/docs`
5. Click Save

### Step 6.2: Wait for Deployment
- GitHub will deploy automatically
- URL: `https://YOUR_USERNAME.github.io/wakey`

### Step 6.3: (Optional) Custom Domain
1. Add a CNAME file to `docs/` folder:
   ```
   wakey.yourdomain.com
   ```
2. Configure DNS:
   - CNAME record: `wakey` → `YOUR_USERNAME.github.io`

---

## Phase 7: Post-Launch

### Step 7.1: Monitor
1. Check GitHub Issues for bug reports
2. Monitor Supabase dashboard for usage
3. Track download statistics in GitHub Releases

### Step 7.2: Update Process
For new releases:
1. Update version in `package.json`
2. Make code changes
3. Commit and push
4. Run publish command:
   ```bash
   pnpm package:win --publish always
   ```
5. Finalize release on GitHub

### Step 7.3: Auto-Update Testing
1. Install old version
2. Publish new version
3. Verify update notification appears
4. Test update installation

---

## Appendix A: Common Commands

```bash
# Development
pnpm desktop              # Run in dev mode

# Build
pnpm desktop:build        # Build without packaging

# Package
cd apps/desktop
pnpm package              # Package for current platform
pnpm package:win          # Package for Windows only

# Publish
GH_TOKEN=xxx pnpm package:win --publish always

# Clean
pnpm clean                # Clean all builds
```

---

## Appendix B: Troubleshooting

### "Windows protected your PC" warning
- This appears because app isn't code-signed
- Users can click "More info" → "Run anyway"
- Solution: Purchase code signing certificate (~$70-300/year)

### Build fails with native module errors
```bash
# Rebuild native modules
cd apps/desktop
pnpm rebuild
```

### Auto-update not working
1. Check `publish` config in package.json
2. Verify GH_TOKEN is set
3. Ensure GitHub Release is published (not draft)
4. Check `latest.yml` file in release assets

### Supabase connection fails
1. Verify URL and keys are correct
2. Check if project is paused (free tier pauses after inactivity)
3. Test connection in Supabase dashboard

---

## Appendix C: Version Checklist

Before each release:

- [ ] Update version in `apps/desktop/package.json`
- [ ] Update version in root `package.json`
- [ ] Update copyright year if needed
- [ ] Update CHANGELOG.md
- [ ] Test all features locally
- [ ] Test Windows installer
- [ ] Test portable version
- [ ] Test auto-update from previous version
- [ ] Update landing page if needed
- [ ] Create GitHub release notes

---

## Appendix D: Future Enhancements

### Recommended Additions
1. **Error Tracking**: Integrate Sentry
2. **Analytics**: Add privacy-friendly analytics (Plausible/Umami)
3. **Code Signing**: Purchase certificate to remove Windows warning
4. **CI/CD**: Set up GitHub Actions for automated builds
5. **Microsoft Store**: Submit app to Windows Store

### GitHub Actions Workflow (Optional)
Create `.github/workflows/build.yml`:
```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm desktop:build
      - name: Package
        run: cd apps/desktop && pnpm package:win --publish always
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

---

*Implementation plan created for Wakey v0.1.0*
*Last updated: January 14, 2025*
