import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { date } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if questions already exist for this date
    const { data: existing } = await supabase
      .from("quiz_daily_questions")
      .select("questions")
      .eq("question_date", date)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ questions: existing.questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get previous questions to avoid repetition
    const { data: prevQuestions } = await supabase
      .from("quiz_daily_questions")
      .select("questions")
      .order("question_date", { ascending: false })
      .limit(7);

    const previousQuestionTexts = prevQuestions?.flatMap(
      (pq: any) => (pq.questions as any[]).map((q: any) => q.question)
    ) || [];

    const avoidList = previousQuestionTexts.length > 0
      ? `\n\nتجنب تكرار هذه الأسئلة السابقة:\n${previousQuestionTexts.join('\n')}`
      : '';

    // Generate questions using Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `أنت خبير في التاريخ الإسلامي والثقافة الشيعية. مهمتك إنشاء أسئلة دينية وثقافية عن أهل البيت عليهم السلام.
الأسئلة يجب أن تكون متنوعة وتشمل:
- سيرة أهل البيت عليهم السلام (الأئمة الاثني عشر)
- أحاديث أهل البيت
- فقه أهل البيت
- تاريخ الإسلام
- القرآن الكريم
- المناسبات الدينية

القواعد:
- الأسئلة يجب أن تكون بالعربية الفصحى
- كل سؤال له 4 خيارات مع إجابة صحيحة واحدة
- الأسئلة يجب أن تكون متنوعة في الصعوبة
- لا تكرر أسئلة سابقة${avoidList}`
          },
          {
            role: "user",
            content: `أنشئ ٤ أسئلة دينية وثقافية جديدة ومتنوعة عن أهل البيت عليهم السلام لتاريخ ${date}.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz_questions",
              description: "Generate 4 quiz questions about Ahlul Bayt",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string", description: "The question text in Arabic" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          description: "4 answer options in Arabic"
                        },
                        correctIndex: {
                          type: "number",
                          description: "Index of the correct answer (0-3)"
                        }
                      },
                      required: ["question", "options", "correctIndex"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["questions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz_questions" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const generated = JSON.parse(toolCall.function.arguments);
    const questions = generated.questions;

    if (!questions || questions.length !== 4) throw new Error("Invalid questions format");

    // Save to database
    const { error: insertError } = await supabase
      .from("quiz_daily_questions")
      .insert({
        question_date: date,
        questions,
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("questions error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
