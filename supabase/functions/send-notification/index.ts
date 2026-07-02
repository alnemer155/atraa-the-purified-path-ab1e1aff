// v2.11.00 — Send a notification email via Resend (gateway-backed).
// Invoked by the client (or later by pg_cron) after the user opts in and
// stores an email + preference in the platform Notifications Center.
//
// Body: { to: string, type: string, subject: string, html: string }
// The `type` must match one of the user's enabled preference keys; the
// client already validated this — the edge function just forwards.

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend/emails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  to: string;
  type: string;
  subject: string;
  html: string;
  from?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { to, subject, html, from, type } = (await req.json()) as Payload;
    if (!to || !subject || !html || !type) {
      return new Response(JSON.stringify({ error: "missing_fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!lovableKey || !resendKey) {
      return new Response(JSON.stringify({ error: "connector_not_configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from ?? "عترة <notify@atraa.xyz>",
        to: [to],
        subject,
        html,
      }),
    });

    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
