import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Special occasion dates with bonus points
const SPECIAL_DATES: Record<string, number> = {
  '2026-03-28': 5, // عيد الفطر المبارك
  '2026-04-27': 5, // ولادة السيدة فاطمة المعصومة
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { device_id, participant_id, question_date, answers, score, is_friday } = await req.json();

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
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate bonuses
    const fridayBonus = is_friday ? 1.5 : 0;
    const specialBonus = SPECIAL_DATES[question_date] || 0;
    const totalDayScore = score + fridayBonus + specialBonus;

    // Save answer with total score including bonuses
    const { error: answerError } = await supabase
      .from("quiz_answers")
      .insert({
        participant_id,
        question_date,
        answers,
        score: totalDayScore,
      });

    if (answerError) throw answerError;

    // Recalculate total score from all answers
    const { data: allAnswers } = await supabase
      .from("quiz_answers")
      .select("score")
      .eq("participant_id", participant_id);

    const totalScore = allAnswers?.reduce((sum: number, a: any) => sum + (a.score || 0), 0) || 0;

    await supabase
      .from("quiz_participants")
      .update({ score: totalScore })
      .eq("id", participant_id);

    return new Response(JSON.stringify({ success: true, totalScore, fridayBonus, specialBonus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("submit error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
