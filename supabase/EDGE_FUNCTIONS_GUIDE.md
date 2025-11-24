# TellUs - Edge Functions Setup Guide

This guide provides complete instructions for setting up and deploying Supabase Edge Functions for TellUs.

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Supabase account and project set up
- Project linked to Supabase CLI

## Available Edge Functions

### 1. delete-account

Handles secure account deletion with cascade delete of all user data.

**Location**: `supabase/functions/delete-account/index.ts`

**Purpose**: Securely deletes a user account and all associated data (profiles, complaint boxes, complaints)

**Authentication**: Required (JWT verification enabled)

---

## Installation Steps

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

### Step 3: Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID (found in project settings).

### Step 4: Verify Configuration

Check that `supabase/config.toml` has the correct settings:

```toml
project_id = "your-project-id"

[functions.delete-account]
verify_jwt = true
```

---

## Edge Function Code

### delete-account Function

**File**: `supabase/functions/delete-account/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

Deno.serve(async (req) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create a Supabase client with the user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client for deletion
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete the user - this will cascade delete:
    // 1. profiles (via auth.users cascade)
    // 2. complaint_boxes (via admin_id cascade)
    // 3. complaints (via box_id cascade from complaint_boxes)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## Deployment

### Deploy All Functions

```bash
supabase functions deploy
```

### Deploy Specific Function

```bash
supabase functions deploy delete-account
```

### Verify Deployment

```bash
supabase functions list
```

You should see output like:
```
┌─────────────────┬──────────┬─────────────────────────┬─────────┐
│ NAME            │ VERSION  │ CREATED AT              │ STATUS  │
├─────────────────┼──────────┼─────────────────────────┼─────────┤
│ delete-account  │ 1        │ 2024-01-15 10:30:00     │ ACTIVE  │
└─────────────────┴──────────┴─────────────────────────┴─────────┘
```

---

## Testing Edge Functions

### Test delete-account Function

1. **Via Application UI**:
   - Login to your application
   - Navigate to Profile page (`/profile`)
   - Click "Delete Account"
   - Confirm deletion
   - Check if account and all data is deleted

2. **Via cURL**:

```bash
curl -X POST \
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/delete-account' \
  -H 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

Replace:
- `YOUR_PROJECT_ID` with your Supabase project ID
- `YOUR_USER_JWT_TOKEN` with a valid JWT token (get from browser dev tools when logged in)

3. **Expected Response**:

Success:
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

Error:
```json
{
  "error": "Unauthorized"
}
```

---

## Environment Variables

Edge functions automatically have access to these environment variables:

- `SUPABASE_URL`: Your project URL
- `SUPABASE_ANON_KEY`: Anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (admin access)

**No manual configuration needed** - these are automatically injected by Supabase.

---

## Monitoring and Logs

### View Function Logs

1. **Via Supabase Dashboard**:
   - Go to **Edge Functions** section
   - Click on function name
   - View **Logs** tab

2. **Via CLI**:

```bash
supabase functions logs delete-account
```

Add `--follow` to watch logs in real-time:
```bash
supabase functions logs delete-account --follow
```

---

## Troubleshooting

### Issue: Function returns 401 Unauthorized

**Possible Causes**:
1. JWT verification is enabled but no Authorization header sent
2. Invalid or expired JWT token
3. Token format is incorrect

**Solution**:
- Ensure `Authorization: Bearer <token>` header is sent with requests
- Verify token is valid and not expired
- Check that `verify_jwt = true` is set in `config.toml`

### Issue: Function returns 500 Internal Server Error

**Possible Causes**:
1. Environment variables not set correctly
2. Database connection issues
3. Code errors in the function

**Solution**:
- Check function logs: `supabase functions logs delete-account`
- Verify all environment variables are available
- Test database connection separately
- Add more console.log statements for debugging

### Issue: Deployment fails

**Possible Causes**:
1. Not linked to project
2. Authentication issues
3. Syntax errors in code

**Solution**:
```bash
# Re-link project
supabase link --project-ref YOUR_PROJECT_ID

# Re-login
supabase login

# Check for syntax errors in TypeScript files
deno check supabase/functions/delete-account/index.ts
```

### Issue: CASCADE delete not working

**Possible Causes**:
1. Foreign key constraints not set up correctly
2. RLS policies blocking deletion

**Solution**:
- Verify foreign key constraints in `setup.sql`:
```sql
-- Check foreign keys
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

## Creating New Edge Functions

### 1. Create Function Directory

```bash
mkdir -p supabase/functions/your-function-name
```

### 2. Create index.ts File

```bash
touch supabase/functions/your-function-name/index.ts
```

### 3. Add Function Template

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Your function logic here
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

### 4. Update config.toml

Add your function configuration:

```toml
[functions.your-function-name]
verify_jwt = true  # or false for public functions
```

### 5. Deploy

```bash
supabase functions deploy your-function-name
```

---

## Best Practices

1. **Always Enable JWT Verification** for protected functions
2. **Use CORS Headers** for functions called from web browsers
3. **Implement Error Handling** with try-catch blocks
4. **Log Important Events** using console.log/error
5. **Use Service Role Key** only when admin access is required
6. **Validate Input** before processing requests
7. **Return Consistent Response Format** (JSON with proper status codes)
8. **Test Thoroughly** before deploying to production

---

## Security Checklist

✅ JWT verification enabled for protected functions  
✅ Input validation implemented  
✅ Error messages don't expose sensitive information  
✅ Service role key used only when necessary  
✅ CORS configured appropriately  
✅ Logs don't contain sensitive data  
✅ Rate limiting considered for public functions  

---

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)

---

## Support

For issues specific to TellUs edge functions:
- Check function logs first
- Review this guide's troubleshooting section
- Verify database setup is complete
- Check Supabase dashboard for function status

For Supabase-specific issues:
- Visit [Supabase Support](https://supabase.com/support)
- Check [Supabase Discord](https://discord.supabase.com)
