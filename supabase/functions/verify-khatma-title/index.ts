// Verify khatma dedication title using Lovable AI Gateway.
// Removes titles/honorifics (الشيخ، الدكتور، الحاج، السيد، الأستاذ، إلخ.)
// and validates that the wording is respectful and appropriate for a Shia
// Ja'fari Quran dedication. Returns a cleaned title or rejects with reason.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `أنت مدقق صياغة لعناوين ختمات قرآنية في تطبيق شيعي جعفري.

القواعد الصارمة:
1. صيغة العنوان يجب أن تكون: "(المرحوم|المرحومة|الفقيد|الفقيدة) <الاسم> بن/بنت <اسم الأب>" أو "إهداء إلى روح المرحوم..."
2. يُمنع منعاً باتاً أي ألقاب وظيفية أو دينية أو اجتماعية:
   الشيخ، السيد، الحاج، الحاجة، الدكتور، الأستاذ، المهندس، الملا، السيدة، الآية، آية الله، حجة الإسلام، العلامة، البروفيسور، الأخ، الأخت، أبو، أم.
3. يجب أن يكون الاسم مكوناً فقط من: الاسم الأول + اسم الأب (بدون عائلة طويلة أو ألقاب).
4. الصياغة يجب أن تكون محترمة ولائقة بمتوفى عند المسلمين الشيعة.
5. لا تسمح بأي محتوى مسيء أو غير لائق أو غير ديني.

مهمتك:
- حذف أي ألقاب من العنوان وإرجاع نسخة منظفة.
- التحقق من احترام الصياغة.
- إذا كان النص خالياً من اسم متوفى، اقبله إذا كان لائقاً (مثل: "ختمة لقضاء الحوائج").

أعد النتيجة عبر استدعاء الأداة فقط.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title } = await req.json();
    if (typeof title !== "string" || !title.trim() || title.length > 200) {
      return new Response(
        JSON.stringify({ ok: false, reason: "العنوان غير صالح" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
          { role: "user", content: `العنوان المقترح: "${title.trim()}"` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "verify_title",
              description: "Validate and clean the khatma dedication title.",
              parameters: {
                type: "object",
                properties: {
                  approved: {
                    type: "boolean",
                    description: "هل العنوان لائق ومقبول بعد التنظيف؟",
                  },
                  cleaned_title: {
                    type: "string",
                    description: "العنوان بعد إزالة الألقاب (إن وُجدت).",
                  },
                  reason: {
                    type: "string",
                    description: "إن لم يُقبل: سبب الرفض بإيجاز بالعربية.",
                  },
                },
                required: ["approved", "cleaned_title", "reason"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "verify_title" } },
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
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
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

    return new Response(
      JSON.stringify({
        ok: !!args.approved,
        cleaned_title: args.cleaned_title || title.trim(),
        reason: args.reason || "",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-khatma-title error:", e);
    return new Response(
      JSON.stringify({ ok: false, reason: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
