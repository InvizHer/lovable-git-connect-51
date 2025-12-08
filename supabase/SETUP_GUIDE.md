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
   - **anon/public key** (starts with "eyJ...")

3. Update your `.env` file in the project root:

```env
VITE_SUPABASE_URL="your-project-url"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

## Step 3: Run Database Setup SQL

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/setup.sql` file
4. Paste it into the SQL editor
5. Click "Run" or press `Ctrl/Cmd + Enter`

This will create:
- ✅ `admins` table (custom authentication - no Supabase Auth)
- ✅ `complaint_boxes` table with CASCADE DELETE
- ✅ `complaints` table with CASCADE DELETE
- ✅ `feedbacks` table with CASCADE DELETE  
- ✅ `analytics` table with CASCADE DELETE
- ✅ Authentication functions (register_admin, login_admin, etc.)
- ✅ Password hashing using bcrypt (pgcrypto)
- ✅ Indexes for optimized queries
- ✅ Database triggers for analytics
- ✅ Row Level Security (RLS) policies
- ✅ Storage bucket for file uploads

## Step 4: Verify Setup

Run this query in SQL Editor to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- admins
- analytics
- complaint_boxes
- complaints
- feedbacks

## Authentication System

TellUs uses **custom authentication** stored directly in the `admins` table:

- **No Supabase Auth dependency** - All user data in tables
- **No email verification required** - Instant account creation
- **Easy data deletion** - All admin data can be cascade deleted
- **Bcrypt password hashing** - Secure password storage

### How It Works

1. **Registration**: `register_admin()` function hashes password and creates admin
2. **Login**: `login_admin()` function verifies credentials and returns admin data
3. **Session**: Stored in browser localStorage (7-day expiry)
4. **Password Update**: `update_admin_password()` function

## CASCADE DELETE Behavior

When you delete data, related records are automatically removed:

```
Delete Admin Account
  └── All Complaint Boxes deleted
        ├── All Complaints deleted
        ├── All Feedbacks deleted
        └── All Analytics deleted

Delete Complaint Box
  ├── All Complaints deleted
  ├── All Feedbacks deleted
  └── All Analytics deleted
```

## Security Features

✅ Password hashing using bcrypt (pgcrypto)
✅ Row Level Security (RLS) enabled on all tables
✅ Session-based authentication with expiry
✅ Secure password verification functions
✅ No sensitive data exposed in API responses

## Troubleshooting

### Issue: Cannot register or login

**Solution**: Ensure the pgcrypto extension is enabled:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Issue: "function does not exist" error

**Solution**: Re-run the entire `setup.sql` file to create all functions.

### Issue: File uploads failing

**Solution**:
1. Verify storage bucket exists: Check **Storage** in dashboard
2. Ensure file size is under 5MB
3. Check allowed file types in bucket settings

### Issue: CASCADE delete not working

**Solution**: Verify foreign key constraints:

```sql
SELECT
    tc.table_name, 
    tc.constraint_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
```

All `delete_rule` values should be `CASCADE`.

## Project Structure

```
supabase/
├── setup.sql              # Complete database setup script
├── SETUP_GUIDE.md         # This guide
├── CASCADE_DELETE_GUIDE.md # CASCADE delete documentation
└── config.toml            # Supabase configuration
```

## Support

For issues specific to TellUs:
- Check the main README.md file
- Review the troubleshooting section above

For Supabase-specific issues:
- Visit [Supabase Support](https://supabase.com/support)
- Check [Supabase Discord](https://discord.supabase.com)
