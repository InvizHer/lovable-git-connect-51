# TellUs - Supabase Setup Guide

Complete database setup guide for TellUs Anonymous Complaint Management System.

## Prerequisites

- Supabase account (https://supabase.com)
- Your project's `.env` file ready for configuration

## Quick Setup (5 Minutes)

### Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details and click "Create"
4. Wait 2-3 minutes for provisioning

### Step 2: Run Database Setup

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy **entire contents** of `supabase/setup.sql`
4. Paste and click "Run"

This creates:
- ✅ All tables with CASCADE DELETE relationships
- ✅ Indexes for performance
- ✅ Functions and triggers
- ✅ Row Level Security policies
- ✅ Storage bucket for attachments

### Step 3: Configure Environment

1. Go to **Settings → API** in Supabase
2. Copy Project URL and anon key
3. Update `.env`:

```env
VITE_SUPABASE_URL="your-project-url"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

### Step 4: Configure Authentication

1. Go to **Authentication → Providers**
2. Ensure Email provider is enabled
3. **Recommended**: Disable "Confirm email" for easier testing

### Step 5: Configure Redirect URLs

1. Go to **Authentication → URL Configuration**
2. Set Site URL to your app URL (e.g., `https://your-app.netlify.app`)
3. Add Redirect URLs:
   - Your production URL
   - `http://localhost:5173` (for local development)

## Database Schema

### Tables

| Table | Description | CASCADE Behavior |
|-------|-------------|------------------|
| `profiles` | User profiles linked to auth.users | Deleted when auth user deleted |
| `complaint_boxes` | Admin-created complaint boxes | Deletes all child records |
| `complaints` | Anonymous complaints | Auto-deleted with parent box |
| `feedbacks` | Anonymous ratings | Auto-deleted with parent box |
| `analytics` | Daily statistics | Auto-deleted with parent box |

### CASCADE Delete Behavior

When a **complaint box** is deleted:
- All complaints are automatically deleted
- All feedbacks are automatically deleted
- All analytics data is automatically deleted

When an **auth user** is deleted:
- Their profile is automatically deleted
- All their complaint boxes are deleted (which cascades to complaints, feedbacks, analytics)

## Authentication Flow

### Login Process
1. User enters email/password
2. Supabase Auth validates credentials
3. App verifies user has a profile in database
4. If no profile exists, user is redirected to signup

### Signup Process
1. User creates account via Supabase Auth
2. Database trigger automatically creates profile
3. If trigger fails, app creates profile manually
4. User is logged in and redirected to dashboard

## Verification Queries

Run these in SQL Editor to verify setup:

### Check Tables Exist
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

Expected: `analytics`, `complaint_boxes`, `complaints`, `feedbacks`, `profiles`

### Check CASCADE Constraints
```sql
SELECT tc.table_name, kcu.column_name, 
       ccu.table_name AS foreign_table, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';
```

All should show `delete_rule = 'CASCADE'`

### Check RLS Enabled
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

All should show `rowsecurity = true`

## Troubleshooting

### "User not found in database"
- User exists in auth.users but not in profiles
- Solution: User should create new account via signup

### Complaint box deletion not cascading
- Run the complete `setup.sql` again
- Verify CASCADE constraints with query above

### Login redirects to signup
- Profile doesn't exist for this auth user
- Normal behavior - user needs to complete signup

### File uploads failing
- Verify storage bucket exists in **Storage** dashboard
- Check file size is under 5MB
- Verify file type is allowed

## Security Notes

- All tables have Row Level Security enabled
- Users can only access their own data
- Anonymous submission is allowed for complaints/feedbacks
- Storage policies restrict access appropriately

## Support

- Check Supabase logs in dashboard for errors
- Review browser console for client-side issues
- Verify environment variables are set correctly
