// Verify a reader's triple Arabic name (first + father + family) for
// khatma recitation registration. Uses Lovable AI gateway to ensure the
// name is real, respectful, and free of titles/insults/non-name content.
//
// Bypass: if user types exactly "تخطي ذلك", we skip without invoking AI.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `أنت مدقق أسماء لتسجيل قراءات في تطبيق ختمات شيعي جعفري.

القواعد:
1. الاسم يجب أن يكون ثلاثياً: الاسم الأول + اسم الأب + اسم العائلة، بحروف عربية فقط ومسافات.
2. يُمنع منعاً باتاً أي ألقاب: الشيخ، السيد، الحاج، الدكتور، الأستاذ، المهندس، أبو، أم، الملا، آية الله.
3. يُمنع أي محتوى مسيء أو غير لائق أو غير عربي أو أرقام أو رموز.
4. ارفض الأسماء العشوائية أو غير الحقيقية أو الكلمات التي ليست أسماء.

المهمة:
- تحقّق من صحة الاسم الثلاثي.
- نظّفه من أي ألقاب إن وجدت.
- أعد النتيجة عبر استدعاء الأداة فقط.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name } = await req.json();
    if (typeof name !== "string" || !name.trim() || name.length > 120) {
      return new Response(JSON.stringify({ ok: false, reason: "الاسم غير صالح" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmed = name.trim().replace(/\s+/g, " ");
    if (trimmed === "تخطي ذلك") {
      return new Response(JSON.stringify({ ok: true, cleaned_name: "", skipped: true, reason: "" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `الاسم المقترح: "${trimmed}"` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "verify_name",
            description: "Validate and clean the reader's triple name.",
            parameters: {
              type: "object",
              properties: {
                approved: { type: "boolean" },
                cleaned_name: { type: "string" },
                reason: { type: "string" },
              },
              required: ["approved", "cleaned_name", "reason"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "verify_name" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ ok: false, reason: "تجاوز الحد، حاول لاحقاً" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ ok: false, reason: "نفاد الرصيد" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      console.error("AI gateway error:", resp.status, await resp.text());
      return new Response(JSON.stringify({ ok: false, reason: "تعذّر التحقق" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : null;
    if (!args) {
      return new Response(JSON.stringify({ ok: false, reason: "تعذّر تحليل الاستجابة" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      ok: !!args.approved,
      cleaned_name: args.cleaned_name || trimmed,
      skipped: false,
      reason: args.reason || "",
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("verify-reader-name error:", e);
    return new Response(JSON.stringify({ ok: false, reason: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
