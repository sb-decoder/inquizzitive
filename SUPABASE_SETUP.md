# Supabase Setup Guide for Inquizzitive

This guide will help you set up Supabase authentication and database for the Inquizzitive quiz application.

## Prerequisites

- Node.js and npm installed
- A Supabase account (sign up at https://supabase.com)

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project name: `inquizzitive`
5. Enter a strong database password
6. Choose a region close to your users
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Project API Key (anon public)

## Step 3: Update Environment Variables

Your `.env` file should already contain:
```
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=.....
```

If you need to update these values with your own Supabase project:
1. Replace `VITE_SUPABASE_URL` with your Project URL
2. Replace `VITE_SUPABASE_ANON_KEY` with your anon public key

## Step 4: Set Up Database Tables

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the entire contents of `database-setup.sql` file
3. Click "Run" to execute the SQL commands

This will create:
- `profiles` table for user profiles
- `quiz_history` table for storing quiz results
- Row Level Security (RLS) policies
- Automatic profile creation trigger
- Necessary indexes for performance

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Under "Site URL", add your local development URL: `http://localhost:5173`
3. Under "Redirect URLs", add: `http://localhost:5173`
4. Enable email confirmations if desired (optional for development)

## Step 6: Testing 

1. Start your development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5173`

3. Test the authentication:
   - Click "Sign In" button
   - Try creating a new account
   - Verify email confirmation
   - Sign in with your credentials

4. Test quiz functionality:
   - Take a quiz while signed in
   - Check that the quiz results are saved to your database
   - Verify in Supabase dashboard under Database > Tables > quiz_history

 