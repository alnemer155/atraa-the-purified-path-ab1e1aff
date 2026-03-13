import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, options } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "أنت مساعد في مسابقة دينية عن أهل البيت عليهم السلام. أعطِ تلميحاً مفيداً واحداً فقط للسؤال دون ذكر الإجابة الصحيحة مباشرة. التلميح يجب أن يكون جملة واحدة قصيرة بالعربية الفصحى. ممنوع منعاً باتاً إعطاء الإجابة.",
          },
          {
            role: "user",
            content: `السؤال: ${question}\nالخيارات: ${options.join('، ')}\n\nأعطني تلميحاً واحداً فقط.`,
          },
        ],
        max_tokens: 100,
      }),
    });

    if (!aiResponse.ok) throw new Error("AI hint failed");

    const aiData = await aiResponse.json();
    const hint = aiData.choices?.[0]?.message?.content || "فكّر جيداً في السؤال وارجع للمصادر";

    return new Response(JSON.stringify({ hint }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("hint error:", e);
    return new Response(JSON.stringify({ hint: "تعذر الحصول على تلميح، حاول مجدداً" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
