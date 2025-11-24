# TellUs - Supabase Setup Guide

This guide will help you set up the complete backend infrastructure for TellUs using Supabase.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Basic understanding of SQL and PostgreSQL

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in the project details:
   - **Name**: TellUs (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Configure Environment Variables

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., https://xxxxx.supabase.co)
   - **Project ID** (e.g., xxxxx)
   - **anon/public key** (starts with "eyJ...")

3. Update your `.env` file in the project root:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="your-project-url"
```

4. Update `supabase/config.toml` with your project ID:

```toml
project_id = "your-project-id"

[functions.delete-account]
verify_jwt = true
```

## Step 3: Run Database Setup SQL

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/setup.sql` file
4. Paste it into the SQL editor
5. Click "Run" or press `Ctrl/Cmd + Enter`

This will create:
- ✅ All database tables (profiles, complaint_boxes, complaints, feedbacks, analytics)
- ✅ Indexes for optimized queries
- ✅ Functions and triggers for automation
- ✅ Row Level Security (RLS) policies
- ✅ Storage bucket for file uploads

**Note**: The setup.sql file contains all necessary queries. You only need to run this file once.

## Step 4: Deploy Edge Functions

**For detailed edge function setup, deployment, and code, see [EDGE_FUNCTIONS_GUIDE.md](./EDGE_FUNCTIONS_GUIDE.md)**

Quick deployment steps:

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login and link project:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```

3. Deploy all functions:
```bash
supabase functions deploy
```

**Available Edge Functions:**
- `delete-account`: Handles secure account deletion with cascade delete of all user data

For complete code, troubleshooting, and advanced configuration, refer to the Edge Functions Guide.

## Step 5: Configure Storage Bucket (Automated via setup.sql)

The storage bucket `complaint-attachments` is automatically created when you run setup.sql.

If you need to manually verify or configure:

1. Go to **Storage** in Supabase dashboard
2. Verify `complaint-attachments` bucket exists
3. The RLS policies are already set up via setup.sql

## Step 6: Verify Setup

### Test Database Tables

Run this query in SQL Editor to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- analytics
- complaint_boxes
- complaints
- feedbacks
- profiles

### Test Authentication

1. Start your application
2. Navigate to `/signup`
3. Create a test account
4. Verify you can login

### Test Edge Functions

In your application, try to delete the test account from profile settings to verify the edge function works.

## Security Checklist

✅ Row Level Security (RLS) enabled on all tables  
✅ Authentication configured with JWT tokens  
✅ Storage policies restrict file access appropriately  
✅ Edge functions use proper authentication  
✅ Environment variables stored securely (not committed to git)  

## Database Schema Overview

### Core Tables

**profiles**: User profile information
- Links to `auth.users` (Supabase Auth)
- Stores username and email

**complaint_boxes**: Admin-created complaint boxes
- Each box has a unique token for access
- Optional password protection
- Linked to admin profile

**complaints**: Anonymous complaints submitted to boxes
- Unique tracking token (CPL-XXXXXXXX format)
- Status tracking (received, under_review, solved)
- File attachment support
- Admin reply functionality

**feedbacks**: Anonymous ratings for complaint boxes
- 1-5 star ratings
- Optional feedback messages

**analytics**: Automated analytics aggregation
- Daily statistics per complaint box
- Updated via database triggers

## Troubleshooting

### Issue: Cannot see submitted data

**Solution**: Check RLS policies. The setup.sql file includes all necessary policies, but verify they're enabled:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Issue: Edge function returns 401 Unauthorized

**Solution**: 
1. Verify the function is deployed: `supabase functions list`
2. Check that `verify_jwt = true` is set in config.toml
3. Ensure Authorization header is being sent with requests

### Issue: File uploads failing

**Solution**:
1. Verify storage bucket exists: Check **Storage** in dashboard
2. Check storage policies in SQL Editor:
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'complaint-attachments';
```
3. Ensure file size is under 5MB

### Issue: Database triggers not firing

**Solution**: Verify triggers are created:

```sql
SELECT trigger_name, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## Migration from Lovable Cloud

If you previously used Lovable Cloud and want to migrate to your own Supabase:

1. Export data from Lovable Cloud (if needed)
2. Follow all steps in this guide to set up your new Supabase project
3. Update environment variables in `.env` file
4. Import your data using SQL INSERT statements
5. Test all functionality

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)

## Support

For issues specific to TellUs:
- Check the main README.md file
- Review the troubleshooting section
- Check Supabase dashboard logs

For Supabase-specific issues:
- Visit [Supabase Support](https://supabase.com/support)
- Check [Supabase Discord](https://discord.supabase.com)
