# Vercel Deployment Guide

This application is **designed for Vercel deployment** and follows Vercel best practices.

## Key Vercel Compatibility Features

- Next.js 14 App Router (fully compatible with Vercel)
- Server-side rendering with Supabase SSR
- API routes for backend functionality
- Static asset optimization
- Environment variable management
- Zero-config deployment

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy from project root

```bash
vercel
```

### 3. Set up environment variables

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 4. Redeploy with environment variables

```bash
vercel --prod
```

## Vercel Project Configuration

Create `vercel.json` in project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_APP_URL": {
      "value": "https://your-app.vercel.app"
    }
  },
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

## Production Checklist

- [ ] All environment variables configured in Vercel dashboard
- [ ] Build command succeeds (`npm run build`)
- [ ] No build warnings or errors
- [ ] Supabase production database configured
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate is active
- [ ] Performance optimizations applied

## Environment Variables

### Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # Server-side only

# Application Settings
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
SENTRY_DSN=your_sentry_dsn # Error tracking

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES=false
```

### Environment Setup

#### Development Environment

```bash
# Development setup
cp .env.example .env.local
# Edit .env.local with your values

# Verify environment variables are loaded
npm run dev
```

#### Production Environment (Vercel)

**Method 1: Vercel CLI**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
```

**Method 2: Vercel Dashboard**
1. Go to your project dashboard on vercel.com
2. Navigate to Settings > Environment Variables
3. Add each environment variable for Production environment
4. Redeploy to apply changes

### Environment Variable Validation

Add to `src/lib/env.ts` for runtime validation:

```tsx
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
}

// Validate required environment variables at build time
Object.entries(env).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})
```

## Common Deployment Issues

### 1. Environment Variable Issues
**Problem**: "Invalid API key" or connection errors
**Solution**: Verify all environment variables are set correctly in Vercel dashboard

### 2. Build Failures
**Problem**: Build fails during deployment
**Solution**: Run `npm run build` locally to identify issues, ensure all dependencies are listed in package.json

### 3. API Route Timeouts
**Problem**: API routes timing out
**Solution**: Ensure API routes complete within 10 seconds (configured in vercel.json)

### 4. Database Connection Issues
**Problem**: Cannot connect to Supabase in production
**Solution**: Check that production database URL and keys are correctly configured