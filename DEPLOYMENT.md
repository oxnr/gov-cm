# Deployment Guide for GovChime

## Prerequisites
- Vercel account
- Supabase project (already created)
- GitHub repository (already connected)

## Environment Variables Needed

Add these to your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=https://fustpnrghlksvezxdgrn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1c3RwbnJnaGxrc3ZlenhkZ3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjg4MDIsImV4cCI6MjA2NDcwNDgwMn0.ONTVu3IGvcqnzkxkf1fWgsLOhxGWa0F-hzeoB7ynnZo
NEXT_PUBLIC_APP_NAME=GovChime
NEXT_PUBLIC_APP_DESCRIPTION=Government Contract Intelligence Platform
```

## Deployment Steps

### 1. Deploy to Vercel

Option A: Using Vercel CLI
```bash
npm i -g vercel
vercel
```

Option B: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository: `oxnr/gov-cm`
3. Vercel will auto-detect Next.js

### 2. Configure Environment Variables

1. In Vercel dashboard, go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable from the list above
4. Make sure they're available for all environments (Production, Preview, Development)

### 3. Configure Build Settings (if needed)

- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)
- Root Directory: `./`

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at the provided Vercel URL

## Post-Deployment

### Database Connection
Your Supabase database is already configured and contains:
- 2000+ government contracts
- State data
- NAICS codes

No additional database setup needed!

### Custom Domain (Optional)
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### If you see database connection errors:
1. Verify environment variables are set correctly in Vercel
2. Check that your Supabase project is active
3. Ensure the anon key hasn't been regenerated

### If you see build errors:
1. Check the build logs in Vercel
2. Ensure all dependencies are in package.json
3. Try building locally first with `npm run build`

## Data Management

To import more data or update existing data:
1. Use the scripts in `/scripts` directory
2. Set the `SUPABASE_DB_URL` environment variable locally
3. Run: `python3 scripts/import_contracts_chunked.py`

## Support

For issues with:
- Vercel deployment: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs