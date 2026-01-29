-- Database Trigger for n8n Webhook
-- This creates a trigger that calls the Edge Function on new form submissions
-- Run this AFTER deploying the Edge Function

-- Option 1: Use pg_net extension to call Edge Function directly
-- (Requires pg_net extension enabled in Supabase dashboard)

-- Enable pg_net if not already enabled
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to call Edge Function
CREATE OR REPLACE FUNCTION notify_n8n_on_submission()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  payload JSONB;
BEGIN
  -- Get the Edge Function URL from secrets or hardcode it
  -- In production, use: supabase secrets set EDGE_FUNCTION_URL=...
  edge_function_url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-n8n';

  -- Build payload
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'form_submissions',
    'record', row_to_json(NEW)
  );

  -- Call Edge Function asynchronously using pg_net
  -- PERFORM net.http_post(
  --   url := edge_function_url,
  --   headers := jsonb_build_object(
  --     'Content-Type', 'application/json',
  --     'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
  --   ),
  --   body := payload::text
  -- );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on form_submissions table
DROP TRIGGER IF EXISTS trigger_notify_n8n ON form_submissions;

-- Uncomment to enable automatic n8n notifications:
-- CREATE TRIGGER trigger_notify_n8n
--   AFTER INSERT ON form_submissions
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_n8n_on_submission();

-- ============================================
-- ALTERNATIVE: Use Supabase Database Webhooks
-- ============================================
-- Instead of the trigger above, you can use Supabase Database Webhooks
-- in the dashboard:
--
-- 1. Go to Database > Webhooks
-- 2. Create new webhook:
--    - Name: notify-n8n-on-submission
--    - Table: form_submissions
--    - Events: INSERT
--    - Type: Supabase Edge Function
--    - Function: notify-n8n
--
-- This is the recommended approach as it's more reliable and easier to manage.
