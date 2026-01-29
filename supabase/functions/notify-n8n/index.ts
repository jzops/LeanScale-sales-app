/**
 * Supabase Edge Function: notify-n8n
 *
 * Triggered by database changes (via webhook or directly) to send
 * form submissions to an n8n webhook for automation workflows.
 *
 * Deploy with: supabase functions deploy notify-n8n
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FormSubmission {
  id: string;
  customer_id: string;
  form_type: string;
  data: Record<string, unknown>;
  submitted_at: string;
  customer?: {
    name: string;
    slug: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");

    if (!N8N_WEBHOOK_URL) {
      console.warn("N8N_WEBHOOK_URL not configured");
      return new Response(
        JSON.stringify({ error: "n8n webhook not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse the incoming payload
    const payload = await req.json();

    // Handle different trigger types
    let submission: FormSubmission;

    if (payload.type === "INSERT" && payload.table === "form_submissions") {
      // Database webhook trigger (from Supabase)
      submission = payload.record as FormSubmission;
    } else if (payload.id && payload.form_type) {
      // Direct API call with submission data
      submission = payload as FormSubmission;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid payload format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Enrich with customer data if not present
    if (!submission.customer && submission.customer_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: customer } = await supabase
        .from("customers")
        .select("name, slug")
        .eq("id", submission.customer_id)
        .single();

      if (customer) {
        submission.customer = customer;
      }
    }

    // Format payload for n8n
    const n8nPayload = {
      event: "form_submission",
      timestamp: new Date().toISOString(),
      submission: {
        id: submission.id,
        formType: submission.form_type,
        submittedAt: submission.submitted_at,
        data: submission.data,
      },
      customer: submission.customer || {
        name: "Unknown",
        slug: "unknown",
      },
      // Metadata for n8n workflows
      source: "leanscale-sales-app",
      environment: Deno.env.get("ENVIRONMENT") || "production",
    };

    // Send to n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("n8n webhook failed:", n8nResponse.status, errorText);

      return new Response(
        JSON.stringify({
          error: "n8n webhook failed",
          status: n8nResponse.status,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Successfully sent to n8n:", submission.id);

    return new Response(
      JSON.stringify({
        success: true,
        submissionId: submission.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Edge function error:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
