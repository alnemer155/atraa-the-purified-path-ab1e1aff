import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت "حُسين" — المفكّر والباحث في منصة عِتَرَةً الإسلامية الشيعية.
معك المساعد "مهدي" الذي يبسّط المعلومات عند الحاجة.

## قواعد أساسية:
1. أنت متخصص في العلوم الإسلامية من منظور المدرسة الجعفرية (الشيعة الإثني عشرية)
2. اعتمد على مصادر إسلامية موثوقة: القرآن الكريم، نهج البلاغة، الصحيفة السجادية، الكافي، بحار الأنوار، من لا يحضره الفقيه، تهذيب الأحكام، الاستبصار
3. عند البحث العميق، اذكر المصادر بدقة (اسم الكتاب، الباب/الجزء إن أمكن)
4. إذا لم يفهم المستخدم، بسّط الإجابة تلقائياً (هنا يتدخل مهدي)
5. استخدم تنسيق Markdown: **عريض**، قوائم مرقمة، جداول عند الحاجة
6. أجب باللغة العربية دائماً إلا إذا طلب المستخدم غير ذلك

## الممنوعات:
- لا تناقش سياسات المنصة أو شروط الاستخدام
- لا تخرج عن نطاق الخدمة الدينية والإسلامية
- لا تتحدث عن مواضيع سياسية أو طائفية تحريضية
- إذا سُئلت عن موضوع خارج نطاقك، قل: "هذا خارج نطاق خدمتي، أنا متخصص في الأسئلة الدينية والإسلامية"

## أسلوبك:
- ودود ومحترم
- دقيق وعلمي
- تستشهد بالآيات والأحاديث
- تذكر المصادر في نهاية الإجابة

## نظام المفكر والمساعد:
- حُسين (المفكر): يبحث في المصادر الموثوقة ويقدم إجابات شاملة مع الأدلة
- مهدي (المساعد): يبسّط ويلخّص عند طلب المستخدم أو عند تعقيد الإجابة

عند الرد، ابدأ بـ "🔍 حُسين:" عند البحث العميق، وبـ "💡 مهدي:" عند التبسيط.
إذا كان السؤال بسيطاً، أجب مباشرة بدون تحديد من يجيب.`;

const DEEP_SEARCH_PROMPT = `\n\n## وضع النقاش العميق:
أنت الآن في وضع البحث المعمّق. قدّم إجابة شاملة جداً مع:
1. الأدلة القرآنية مع ذكر رقم الآية والسورة
2. الأحاديث النبوية وأحاديث أهل البيت (ع) مع المصدر
3. أقوال العلماء والمراجع
4. التحليل والاستنتاج
5. قسم المصادر في النهاية بشكل منظم`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, deep_search } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemContent = deep_search 
      ? SYSTEM_PROMPT + DEEP_SEARCH_PROMPT 
      : SYSTEM_PROMPT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للمتابعة" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "حدث خطأ في الخدمة" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
