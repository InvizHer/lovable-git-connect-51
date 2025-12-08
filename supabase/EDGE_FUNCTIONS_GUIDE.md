# TellUs - Edge Functions Guide & Template

This guide provides instructions for creating and deploying custom Supabase Edge Functions for TellUs when needed.

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Supabase account and project set up
- Project linked to Supabase CLI

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

Check that `supabase/config.toml` has the correct project ID:

```toml
project_id = "your-project-id"
```

---

## Creating a New Edge Function

### Step 1: Create Function Directory

```bash
mkdir -p supabase/functions/your-function-name
```

### Step 2: Create index.ts File

Create `supabase/functions/your-function-name/index.ts`

### Edge Function Template

Here's a basic template for creating authenticated edge functions:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

// CORS headers for web app access
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
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
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
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Your function logic here
    console.log('Function called by user:', user.id)

    // Example: Parse request body
    const body = await req.json()
    console.log('Request body:', body)

    // Example: Database operations using the client
    const { data, error } = await supabaseClient
      .from('your_table')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Operation completed successfully',
        data: data 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

### Step 3: Configure Function Settings

Add your function configuration to `supabase/config.toml`:

```toml
project_id = "your-project-id"

[functions.your-function-name]
verify_jwt = true  # Set to false for public functions (webhooks, etc.)
```

**Security Note**: 
- `verify_jwt = true` - Requires authentication (recommended for most functions)
- `verify_jwt = false` - Public access (only use for webhooks or public APIs)

---

## Deployment

### Deploy All Functions

```bash
supabase functions deploy
```

### Deploy Specific Function

```bash
supabase functions deploy your-function-name
```

### Verify Deployment

```bash
supabase functions list
```

---

## Calling Edge Functions from Frontend

### Example: Call from React Component

```typescript
import { supabase } from "@/integrations/supabase/client";

const callEdgeFunction = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('your-function-name', {
      body: { 
        // Your request payload
        param1: 'value1',
        param2: 'value2'
      }
    });

    if (error) throw error;

    console.log('Function response:', data);
    return data;
  } catch (error) {
    console.error('Error calling edge function:', error);
    throw error;
  }
};
```

---

## Environment Variables

Edge functions have access to these environment variables automatically:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (for admin operations)
- `SUPABASE_DB_URL` - Direct database connection URL

### Adding Custom Secrets

```bash
supabase secrets set MY_SECRET_KEY=your_secret_value
```

Access in function:
```typescript
const secretKey = Deno.env.get('MY_SECRET_KEY')
```

---

## Testing Edge Functions

### Local Testing

```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve your-function-name
```

### Test with cURL

```bash
curl -i --location --request POST \
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/your-function-name' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'
```

---

## Monitoring & Logs

### View Function Logs

```bash
supabase functions logs your-function-name
```

### View in Dashboard

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on your function
4. View Logs tab

---

## Common Use Cases

### 1. Sending Emails
Use services like SendGrid, Mailgun, or Resend to send transactional emails.

### 2. Payment Processing
Integrate with Stripe, PayPal, or other payment gateways securely.

### 3. External API Integration
Call third-party APIs with your API keys safely stored as secrets.

### 4. Complex Database Operations
Perform operations that require service_role key or complex transactions.

### 5. Scheduled Tasks
Set up cron jobs to run periodic maintenance tasks.

### 6. Webhooks
Receive and process webhooks from external services.

---

## Best Practices

1. **Always use CORS headers** for functions called from web apps
2. **Validate input** - Never trust user input
3. **Use authentication** unless building a public webhook
4. **Log important operations** for debugging
5. **Handle errors gracefully** and return meaningful error messages
6. **Keep functions focused** - One function should do one thing well
7. **Use TypeScript** for better type safety
8. **Test locally** before deploying to production
9. **Monitor logs** regularly for errors and performance issues
10. **Store secrets** in environment variables, never in code

---

## Troubleshooting

### Issue: Function returns 401 Unauthorized

**Solution**: 
1. Verify JWT verification is configured correctly in config.toml
2. Check that Authorization header is being sent with requests
3. Ensure user is authenticated before calling function

### Issue: Function times out

**Solution**:
1. Check function logs for errors
2. Optimize database queries
3. Consider increasing timeout (default is 30s)
4. Use async operations properly

### Issue: CORS errors in browser

**Solution**:
1. Ensure CORS headers are included in all responses
2. Add OPTIONS handler for preflight requests
3. Include corsHeaders in all response objects

---

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

## Support

For TellUs-specific issues:
- Check the main README.md
- Review the SETUP_GUIDE.md
- Verify your Supabase project configuration

For Supabase-specific issues:
- Visit [Supabase Support](https://supabase.com/support)
- Check [Supabase Discord](https://discord.supabase.com)
