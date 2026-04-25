import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

/**
 * Refund Policy — Paddle MoR-compliant.
 * Seller: Bin Jaafar. 30-day refund window for all voluntary contributions.
 * Last updated: 2026-04-25 (v2.7.21).
 */
const RefundPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'سياسة الاسترداد' : 'Refund Policy'}
      updated={isAr ? 'آخر تحديث: 2026-04-25' : 'Last updated: 2026-04-25'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              توضّح هذه السياسة كيفية التعامل مع طلبات استرداد المساهمات المالية المُقدَّمة عبر صفحة <span className="font-semibold">"دعم عِتَرَةً"</span> في تطبيق <span className="font-semibold">Atraa</span> الذي يديره <span className="font-semibold">Bin Jaafar</span>.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. طبيعة المساهمة</h2>
            <p>المبالغ المُقدَّمة عبر صفحة الدعم هي <span className="font-semibold">مساهمات طوعية</span> الغرض منها تقدير جهد التطوير والصيانة، وليست رسوماً مقابل خدمة أو اشتراكاً في ميزات إضافية. التطبيق مجاني بالكامل ويعمل بنفس الكفاءة سواء قدّمت مساهمة أم لا.</p>
            <p className="mt-2">أصلاً <span className="font-semibold">المفروض ألا يكون هناك استرداد</span> لأن المبلغ نُقل بنيّة الهبة والتقدير؛ ومع ذلك — احتراماً للمتبرّع وحرصاً على راحته الكاملة — نعتمد سياسة استرداد سخيّة.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. فترة الاسترداد</h2>
            <p>نتيح طلب استرداد <span className="font-semibold">كامل</span> لأي مساهمة خلال <span className="font-semibold">30 يوماً</span> من تاريخ المعاملة، ودون الحاجة إلى تبرير السبب.</p>
            <p className="mt-2">بعد 30 يوماً، تظلّ طلبات الاسترداد ممكنة لكنها تخضع للتقدير الفردي ولشروط Paddle.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. كيف تطلب الاسترداد</h2>
            <p className="mb-2">المسار الأبسط والأسرع:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>زُر بوابة عملاء Paddle: <a className="text-primary underline" href="https://paddle.net" target="_blank" rel="noopener noreferrer">paddle.net</a> وأدخل بريدك الإلكتروني المستخدم في الدفع للحصول على رابط آمن.</li>
              <li>أو راسلنا مباشرةً على <span className="font-semibold">support@atraa.xyz</span> مع رقم الفاتورة (يبدأ بـ INV-) أو رقم معاملة Paddle (يبدأ بـ txn_).</li>
            </ul>
            <p className="mt-2">يُعالَج الاسترداد عادةً خلال 5 أيام عمل، ويظهر في حساب البطاقة/المحفظة خلال 5–10 أيام عمل إضافية حسب البنك.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. شروط Paddle</h2>
            <p>بصفة <span className="font-semibold">Paddle.com Market Limited</span> هو <span className="font-semibold">بائع التسجيل (Merchant of Record)</span> لمعاملاتنا، تُعالَج جميع طلبات الاسترداد عبر أنظمته. تنطبق سياسة Paddle العامة للاسترداد كحدّ أدنى: <a className="text-primary underline" href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noopener noreferrer">paddle.com/legal/refund-policy</a>. سياستنا أعلاه (30 يوماً بدون شروط) هي الأفضل دائماً للمتبرّع.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. الاسترداد الجزئي</h2>
            <p>قد نقبل استرداداً جزئياً في حالات استثنائية (مثلاً: المتبرّع يطلب استبقاء جزء كتقدير وإرجاع الباقي). تواصل معنا لشرح الحالة.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. لا أحقّيّة قانونية مزدوجة</h2>
            <p>الموافقة على استرداد لا تُعدّ اعترافاً بأي خطأ من جانبنا، ولا تنشئ حقاً قانونياً لاسترداد مساهمات لاحقة بغير شروط هذه السياسة.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. التواصل</h2>
            <p><span className="font-semibold">Bin Jaafar</span><br />البريد: <span className="font-semibold">support@atraa.xyz</span><br />بوابة Paddle للعملاء: <span className="font-semibold">paddle.net</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              This Policy explains how we handle refund requests for financial contributions made through the <span className="font-semibold">"Support Atraa"</span> page of the <span className="font-semibold">Atraa</span> app, operated by <span className="font-semibold">Bin Jaafar</span>.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Nature of the Contribution</h2>
            <p>Amounts offered via the support page are <span className="font-semibold">voluntary contributions</span> as appreciation for development and maintenance effort, not fees for a service or a subscription to extra features. The app is fully free and operates identically whether you contribute or not.</p>
            <p className="mt-2">Strictly speaking <span className="font-semibold">refunds shouldn’t be needed</span> because the contribution was made as a gift; however — out of respect for the contributor and to keep the experience worry-free — we adopt a generous refund policy.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Refund Window</h2>
            <p>We offer a <span className="font-semibold">full refund</span> on any contribution within <span className="font-semibold">30 days</span> of the transaction, no reason required.</p>
            <p className="mt-2">After 30 days, refund requests remain possible at our discretion and subject to Paddle’s terms.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. How to Request a Refund</h2>
            <p className="mb-2">The simplest paths:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Visit the Paddle customer portal at <a className="text-primary underline" href="https://paddle.net" target="_blank" rel="noopener noreferrer">paddle.net</a> and enter the email used for payment to receive a secure link.</li>
              <li>Or email us directly at <span className="font-semibold">support@atraa.xyz</span> with the invoice number (starts with <span className="font-mono">INV-</span>) or the Paddle transaction ID (starts with <span className="font-mono">txn_</span>).</li>
            </ul>
            <p className="mt-2">Refunds are typically processed within 5 business days and appear on your card/wallet within 5–10 additional business days, depending on your bank.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Paddle Terms</h2>
            <p>As <span className="font-semibold">Paddle.com Market Limited</span> is the <span className="font-semibold">Merchant of Record</span> for our transactions, all refunds are processed through their systems. Paddle’s general refund policy applies as a baseline: <a className="text-primary underline" href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noopener noreferrer">paddle.com/legal/refund-policy</a>. Our policy above (30 days, no questions asked) is always the most contributor-friendly.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Partial Refunds</h2>
            <p>We may accept partial refunds in exceptional cases (e.g., the contributor wants to keep part as appreciation and return the rest). Contact us to explain.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. No Double Legal Right</h2>
            <p>Granting a refund is not an admission of fault on our part and does not create a legal right to refund future contributions outside the terms of this Policy.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. Contact</h2>
            <p><span className="font-semibold">Bin Jaafar</span><br />Email: <span className="font-semibold">support@atraa.xyz</span><br />Paddle customer portal: <span className="font-semibold">paddle.net</span></p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default RefundPage;
