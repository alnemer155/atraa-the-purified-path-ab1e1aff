import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { device_id, participant_id, question_date, answers, score } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify participant
    const { data: participant } = await supabase
      .from("quiz_participants")
      .select("id, device_id")
      .eq("id", participant_id)
      .eq("device_id", device_id)
      .maybeSingle();

    if (!participant) {
      return new Response(JSON.stringify({ error: "Invalid participant" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already answered today
    const { data: existing } = await supabase
      .from("quiz_answers")
      .select("id")
      .eq("participant_id", participant_id)
      .eq("question_date", question_date)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Already answered today" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save answer
    const { error: answerError } = await supabase
      .from("quiz_answers")
      .insert({
        participant_id,
        question_date,
        answers,
        score,
      });

    if (answerError) throw answerError;

    // Update participant score
    const { error: updateError } = await supabase
      .from("quiz_participants")
      .update({ score: supabase.rpc ? undefined : 0 })
      .eq("id", participant_id);

    // Actually sum all scores
    const { data: allAnswers } = await supabase
      .from("quiz_answers")
      .select("score")
      .eq("participant_id", participant_id);

    const totalScore = allAnswers?.reduce((sum: number, a: any) => sum + a.score, 0) || 0;

    await supabase
      .from("quiz_participants")
      .update({ score: totalScore })
      .eq("id", participant_id);

    return new Response(JSON.stringify({ success: true, totalScore }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("submit error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
