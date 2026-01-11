# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Name: "Fiks" (or your preferred name)
   - Database Password: (save this securely)
   - Region: (choose closest to your users)
5. Click "Create new project"

## Step 2: Run the Database Migration

1. Wait for your project to finish setting up
2. Go to the **SQL Editor** in the left sidebar
3. Click "New query"
4. Copy the entire contents of `supabase/migrations/20260111_initial_schema.sql`
5. Paste into the SQL editor
6. Click "Run" or press `Ctrl+Enter`
7. You should see a success message

## Step 3: Get Your API Credentials

1. Go to **Settings** (gear icon in sidebar)
2. Click **API** in the settings menu
3. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 4: Configure Your App

1. In your project root, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 5: Verify Database Tables

1. In Supabase dashboard, go to **Table Editor**
2. You should see three tables:
   - `profiles`
   - `jobs`
   - `bids`
3. Click on each to verify the columns match the schema

## Step 6: Test the Connection

Run your app:
```bash
npm start
```

The Supabase client is configured in `src/services/supabase.ts` and ready to use!

## Security Notes

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Policies ensure users can only access their own data
- ✅ The `anon` key is safe to use in your mobile app
- ❌ Never commit your `.env` file to git (it's in `.gitignore`)

## Next Steps

You can now start building features:
- User authentication (sign up/login)
- Job posting
- Bidding system
- Profile management
