import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { device_id, nickname, emoji, bio, bio_public, age } = await req.json();

    if (!device_id || !nickname || !emoji || !age) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (age < 5 || age > 60) {
      return new Response(JSON.stringify({ error: "Age must be between 5 and 60" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if already registered
    const { data: existing } = await supabase
      .from("quiz_participants")
      .select("*")
      .eq("device_id", device_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ participant: existing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("quiz_participants")
      .insert({
        device_id,
        nickname,
        emoji,
        bio: bio || null,
        bio_public: bio_public || false,
        age,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ participant: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("register error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
