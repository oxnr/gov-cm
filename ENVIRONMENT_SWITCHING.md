# Environment Switching Guide

This guide explains how to switch between Production (Supabase) and Development (Local PostgreSQL) environments.

## Current Setup

The application supports two database modes:
- **Production**: Uses Supabase cloud database
- **Development**: Uses local PostgreSQL database

## How to Switch Environments

### Method 1: Using Environment Variable (Recommended)

Edit your `.env.local` file and change the `NEXT_PUBLIC_DATABASE_MODE` variable:

```bash
# For Production (Supabase)
NEXT_PUBLIC_DATABASE_MODE=production

# For Development (Local PostgreSQL)
NEXT_PUBLIC_DATABASE_MODE=development
```

### Method 2: Using Multiple .env Files

Create separate environment files:

1. **`.env.production`** - For Supabase
```env
NEXT_PUBLIC_DATABASE_MODE=production
NEXT_PUBLIC_SUPABASE_URL=https://fustpnrghlksvezxdgrn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

2. **`.env.development`** - For Local PostgreSQL
```env
NEXT_PUBLIC_DATABASE_MODE=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=govchime
DB_USER=govchime
DB_PASSWORD=govchime_secure_password
```

Then run with specific environment:
```bash
# Use production (Supabase)
cp .env.production .env.local
npm run dev

# Use development (Local PostgreSQL)
cp .env.development .env.local
npm run dev
```

## Quick Switch Script

Create a switch script for easy toggling:

```bash
# Create switch-env.sh
#!/bin/bash

if [ "$1" = "prod" ]; then
  echo "Switching to Production (Supabase)..."
  sed -i '' 's/NEXT_PUBLIC_DATABASE_MODE=.*/NEXT_PUBLIC_DATABASE_MODE=production/' .env.local
  echo "✅ Switched to Production mode"
elif [ "$1" = "dev" ]; then
  echo "Switching to Development (Local PostgreSQL)..."
  sed -i '' 's/NEXT_PUBLIC_DATABASE_MODE=.*/NEXT_PUBLIC_DATABASE_MODE=development/' .env.local
  echo "✅ Switched to Development mode"
else
  echo "Usage: ./switch-env.sh [prod|dev]"
fi
```

Make it executable:
```bash
chmod +x switch-env.sh
```

Use it:
```bash
./switch-env.sh prod  # Switch to Supabase
./switch-env.sh dev   # Switch to Local PostgreSQL
```

## Verifying Current Mode

The application will log the current database mode when starting:

```
🔄 Database mode: production
```

You can also check in the browser console:
```javascript
console.log(process.env.NEXT_PUBLIC_DATABASE_MODE)
```

## Important Notes

1. **Restart Required**: After changing the environment variable, restart your development server:
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

2. **Data Differences**: The local PostgreSQL and Supabase databases may have different data. Make sure to:
   - Keep local database updated if needed
   - Use the import scripts to sync data

3. **Local PostgreSQL Setup**: For development mode, ensure PostgreSQL is running:
   ```bash
   # Check if PostgreSQL is running
   pg_isready
   
   # Start PostgreSQL (if using Homebrew)
   brew services start postgresql
   ```

4. **API Compatibility**: All API routes automatically use the correct database based on the mode.

## Benefits

- **Fast Local Development**: Use local PostgreSQL for quick iteration
- **Production Testing**: Test with real Supabase data
- **Easy Deployment**: Production builds automatically use Supabase
- **No Code Changes**: Switch environments without modifying code

## Troubleshooting

### Local PostgreSQL Connection Failed
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Check database exists
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname = 'govchime';"

# Create database if needed
createdb govchime
```

### Supabase Connection Failed
- Verify your Supabase project is active
- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct
- Ensure your IP is not blocked in Supabase settings