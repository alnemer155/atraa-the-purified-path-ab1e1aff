import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

/**
 * Privacy Policy — Paddle MoR-compliant.
 * Seller: Bin Jaafar (sole proprietor / individual developer).
 * Last updated: 2026-04-25 (v2.7.21).
 */
const PrivacyPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
      updated={isAr ? 'آخر تحديث: 2026-04-25' : 'Last updated: 2026-04-25'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              تطبيق <span className="font-semibold">عِتَرَةً</span> (Atraa) مُصمَّم على مبدأ <span className="font-semibold">الخصوصية أولاً (Privacy by Design)</span>. لا يوجد حساب مستخدم في التطبيق نفسه، ولا تُجمع أي بيانات شخصية تعريفية لتشغيل ميزاته الأساسية. توضّح هذه السياسة بالتفصيل ما يُخزَّن، وأين، ولماذا، ومن يُشاركنا في معالجة البيانات.
            </p>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed mt-2">
              المتحكّم بالبيانات: <span className="font-semibold">Bin Jaafar</span> (مطوّر فرديّ). البريد للتواصل في كل ما يخصّ الخصوصية: <span className="font-semibold">support@atraa.xyz</span>.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. ملخّص تنفيذي</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>لا حساب، لا تسجيل دخول، لا بريد إلكتروني، لا رقم هاتف لاستخدام التطبيق.</li>
              <li>لا تتبّع إعلاني، ولا أدوات تحليل تعرّف عن المستخدم.</li>
              <li>كل التفضيلات تُحفظ <span className="font-semibold">محلياً على جهازك فقط</span>.</li>
              <li>الطلبات الخارجية محصورة بخدمات دينية وجغرافية، وتُرسَل بإحداثيات المدينة فقط دون أي معرّف للمستخدم.</li>
              <li>عند المساهمة المالية الاختيارية فقط، يُعالَج الدفع عبر شركاء معتمدين (Paddle بصفته بائع التسجيل) ويتم جمع الحدّ الأدنى المطلوب لمعالجة المعاملة وإصدار الفاتورة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. البيانات المخزّنة محلياً (على جهازك)</h2>
            <p className="mb-2">يحفظ التطبيق على جهازك فقط:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">المدينة المختارة</span> واسمها وإحداثياتها (lat, lng).</li>
              <li><span className="font-semibold">تعديل التاريخ الهجري</span> (قيمة بين -2 و +2).</li>
              <li><span className="font-semibold">المذهب</span> المختار في الإعداد الأولي.</li>
              <li><span className="font-semibold">اللغة المفضّلة</span> (عربية / English).</li>
              <li><span className="font-semibold">حالة التسبيح</span> والعدّاد الحالي.</li>
              <li><span className="font-semibold">آخر قراءة</span> في الأدعية والزيارات والأذكار.</li>
              <li><span className="font-semibold">آخر سورة وآية</span> في القرآن (لميزة "متابعة القراءة").</li>
              <li>تفعيل <span className="font-semibold">إشعارات الأذان</span> (نعم/لا فقط).</li>
              <li>كاش <span className="font-semibold">آية اليوم</span> ليوم واحد لتسريع الفتح.</li>
            </ul>
            <p className="mt-2">لا تُرسَل أيٌّ من هذه البيانات إلى أي خادم. تبقى محصورة بجهازك ويمكنك حذفها عبر إعدادات المتصفح/النظام.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. الخدمات الخارجية</h2>
            <p className="mb-2">تُرسَل طلبات HTTPS فقط للخدمات التالية، وبإحداثيات المدينة دون أي معرّف للمستخدم:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">AlAdhan API</span> — لحساب أوقات الصلاة وفق المذهب الجعفري.</li>
              <li><span className="font-semibold">AlQuran.cloud</span> — لجلب نص القرآن الكريم بالرسم العثماني وآية اليوم.</li>
              <li><span className="font-semibold">wttr.in</span> — لجلب حالة الطقس بالموقع التقريبي للمدينة.</li>
              <li><span className="font-semibold">Nominatim (OpenStreetMap)</span> — للبحث عن المدن في الإعدادات.</li>
              <li><span className="font-semibold">Vercel Analytics</span> — قياس عدد الزيارات الإجمالي بشكل مجهول الهوية تماماً (دون cookies تعريفية).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. الاستضافة (Lovable Cloud)</h2>
            <p>التطبيق مستضاف على بنية تحتية تابعة لـ Lovable Cloud (تستخدم Supabase داخلياً) لتخزين سجلّات الفواتير الخاصة بالمساهمات المالية فقط. لا تُحفَظ في هذه البنية أي تفضيلات استخدام أو سجلّ قراءة أو موقع جغرافي.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. المساهمات المالية والدفع</h2>
            <p className="mb-2">عند تقديم مساهمة طوعية لدعم المطوّر:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>تتم معالجة الدفع عبر <span className="font-semibold">Paddle.com Market Limited</span> بصفته <span className="font-semibold">بائع التسجيل (Merchant of Record)</span> لجميع المعاملات.</li>
              <li>تنطبق <span className="font-semibold">شروط Paddle للمشترين</span> (<a className="text-primary underline" href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer">paddle.com/legal/checkout-buyer-terms</a>) و<span className="font-semibold">سياسة خصوصية Paddle</span> (<a className="text-primary underline" href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer">paddle.com/legal/privacy</a>) على معالجة بيانات الدفع.</li>
              <li>يصلنا من Paddle عبر Webhook فقط: معرّف المعاملة، المبلغ، العملة، الحالة، البريد الإلكتروني للمشتري (لإصدار الفاتورة)، ومعرّف عميل Paddle. لا تصلنا أرقام البطاقات أو CVV أبداً.</li>
              <li>تُحفَظ هذه البيانات في جدول <span className="font-semibold">invoices</span> الخاص بنا للأغراض المحاسبية والقانونية فقط.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. مشاركة البيانات</h2>
            <p className="mb-2">لا نبيع البيانات إطلاقاً. نشاركها فقط مع:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Paddle</span> (بائع التسجيل) — لمعالجة المدفوعات وإدارة الضرائب وإصدار الفواتير.</li>
              <li><span className="font-semibold">مزوّدي الاستضافة</span> (Lovable Cloud / Supabase / Vercel) — لتشغيل التطبيق.</li>
              <li><span className="font-semibold">السلطات</span> — في حال طُلب ذلك بحكم قانوني نافذ في المملكة العربية السعودية.</li>
              <li><span className="font-semibold">المستشارين القانونيين والمحاسبين</span> عند الضرورة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. الأساس القانوني للمعالجة</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">المصلحة المشروعة</span> — لتقديم خدمات التطبيق الأساسية.</li>
              <li><span className="font-semibold">تنفيذ العقد</span> — لمعالجة المساهمات المالية وإصدار الفواتير.</li>
              <li><span className="font-semibold">الالتزام القانوني</span> — لحفظ السجلّات المحاسبية حسب الأنظمة المعمول بها.</li>
              <li><span className="font-semibold">الموافقة</span> — لإشعارات الأذان وأي ميزة تطلب صراحةً صلاحية من النظام.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. الاحتفاظ بالبيانات</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>التفضيلات المحلية: تبقى على جهازك ما لم تحذفها بنفسك.</li>
              <li>سجلّات الفواتير: تُحفَظ لمدة <span className="font-semibold">10 سنوات</span> امتثالاً لمتطلبات الضرائب والمحاسبة.</li>
              <li>سجلّات الخدمات الخارجية: تخضع لسياسات تلك الخدمات.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. حقوقك</h2>
            <p className="mb-2">للمستخدمين في كل المناطق، ولا سيّما في الاتحاد الأوروبي/المملكة المتحدة، الحقوق التالية:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>حق <span className="font-semibold">الوصول</span> إلى بياناتك.</li>
              <li>حق <span className="font-semibold">التصحيح</span>.</li>
              <li>حق <span className="font-semibold">الحذف</span> (مع مراعاة فترات الاحتفاظ القانونية).</li>
              <li>حق <span className="font-semibold">التقييد</span> أو <span className="font-semibold">الاعتراض</span> على المعالجة.</li>
              <li>حق <span className="font-semibold">نقل البيانات</span>.</li>
              <li>حق <span className="font-semibold">سحب الموافقة</span> في أي وقت.</li>
              <li>حق التقدّم بشكوى إلى الهيئة الرقابية المختصة.</li>
            </ul>
            <p className="mt-2">لممارسة أيٍّ من هذه الحقوق، راسلنا على: <span className="font-semibold">support@atraa.xyz</span> — نلتزم بالردّ خلال 30 يوماً.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. النقل الدولي للبيانات</h2>
            <p>بنية الاستضافة قد تنقل بيانات المعاملات المالية إلى مراكز بيانات في الاتحاد الأوروبي والمملكة المتحدة والولايات المتحدة. تُطبَّق ضمانات قانونية مناسبة (SCCs أو قرارات كفاية الحماية) عند الاقتضاء.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. الأمان</h2>
            <p>نستخدم تقنيات حماية مناسبة (HTTPS، التشفير في النقل، RLS على قاعدة البيانات، صلاحيات وصول مقيدة) للحفاظ على سلامة البيانات. لا يوجد نظام يمكن ضمان أمانه بنسبة 100%، لكننا نلتزم بالمعايير الصناعية الحديثة.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. ملفات تعريف الارتباط (Cookies)</h2>
            <p>التطبيق نفسه لا يستخدم cookies تعريفية. صفحة الدفع (Paddle) قد تستخدم cookies تشغيلية ضرورية لإتمام عملية الدفع — تخضع لسياسة Paddle المذكورة أعلاه.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">13. الأطفال</h2>
            <p>التطبيق ليس موجهاً إطلاقاً للأطفال دون سنّ 13 عاماً. لا نجمع بيانات شخصية متعمدة من قاصرين.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">14. تحديث السياسة</h2>
            <p>قد نُحدّث هذه السياسة. سيظهر تاريخ آخر تحديث أعلى الصفحة، والتحديثات الجوهرية ستُعلَن داخل التطبيق.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">15. التواصل</h2>
            <p>المتحكّم بالبيانات: <span className="font-semibold">Bin Jaafar</span><br />البريد: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              The <span className="font-semibold">Atraa</span> app (عِتَرَةً) is built on a <span className="font-semibold">Privacy by Design</span> principle. There is no user account inside the app, and no personally identifying data is collected to operate its core features. This Notice explains, in detail, what is stored, where, why, and who shares in processing.
            </p>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed mt-2">
              Data Controller: <span className="font-semibold">Bin Jaafar</span> (sole proprietor / individual developer). Privacy contact: <span className="font-semibold">support@atraa.xyz</span>.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Executive Summary</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>No account, no sign-in, no email, no phone number to use the app.</li>
              <li>No advertising trackers, no user-identifying analytics tools.</li>
              <li>All preferences are stored <span className="font-semibold">locally on your device only</span>.</li>
              <li>External requests are restricted to religious and geographical services and use city coordinates only — no user identifier.</li>
              <li>For optional financial contributions, payments are processed by Paddle (Merchant of Record) and only the minimum data needed for processing and invoicing is collected.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Data Stored Locally (On Your Device)</h2>
            <p className="mb-2">Stored only on your device:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Selected city</span> name and coordinates (lat, lng).</li>
              <li><span className="font-semibold">Hijri date offset</span> (between -2 and +2).</li>
              <li><span className="font-semibold">Madhhab</span> chosen during onboarding.</li>
              <li><span className="font-semibold">Preferred language</span> (Arabic / English).</li>
              <li><span className="font-semibold">Tasbih</span> state and current count.</li>
              <li><span className="font-semibold">Last reading</span> in duas, ziyarat, and adhkar.</li>
              <li><span className="font-semibold">Last surah and ayah</span> in Quran (continue-reading).</li>
              <li><span className="font-semibold">Adhan notifications</span> on/off.</li>
              <li>One-day cache for the <span className="font-semibold">Verse of the Day</span>.</li>
            </ul>
            <p className="mt-2">None of this data is sent to any server. It stays on your device and you can erase it from your browser/system settings.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Third-Party Services</h2>
            <p className="mb-2">HTTPS requests are sent only to:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">AlAdhan API</span> — prayer times via Ja’fari calculation.</li>
              <li><span className="font-semibold">AlQuran.cloud</span> — Uthmani-script Quran text and verse-of-day.</li>
              <li><span className="font-semibold">wttr.in</span> — weather based on approximate city location.</li>
              <li><span className="font-semibold">Nominatim (OpenStreetMap)</span> — city search in Settings.</li>
              <li><span className="font-semibold">Vercel Analytics</span> — fully anonymous aggregate visits (no identifying cookies).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Hosting (Lovable Cloud)</h2>
            <p>The app is hosted on Lovable Cloud infrastructure (which uses Supabase under the hood) for storing invoice records of financial contributions only. No usage preferences, reading history, or geographic data are kept on this infrastructure.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Financial Contributions & Payment</h2>
            <p className="mb-2">When you make a voluntary contribution to support the developer:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Payment is processed by <span className="font-semibold">Paddle.com Market Limited</span> as <span className="font-semibold">Merchant of Record</span> for all transactions.</li>
              <li>Paddle’s <a className="text-primary underline" href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer">Buyer Terms</a> and <a className="text-primary underline" href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer">Privacy Notice</a> apply to payment-data processing.</li>
              <li>Paddle sends us via webhook only: transaction ID, amount, currency, status, buyer email (for invoicing), and Paddle customer ID. We never receive card numbers or CVV.</li>
              <li>This data is stored in our <span className="font-semibold">invoices</span> table for accounting and legal purposes only.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Data Sharing</h2>
            <p className="mb-2">We never sell data. We share only with:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Paddle</span> (Merchant of Record) — for payment processing, tax handling, and invoicing.</li>
              <li><span className="font-semibold">Hosting providers</span> (Lovable Cloud / Supabase / Vercel) — to operate the app.</li>
              <li><span className="font-semibold">Authorities</span> — when legally required under Saudi law.</li>
              <li><span className="font-semibold">Legal and accounting advisors</span> when necessary.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. Legal Bases for Processing</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Legitimate interest</span> — to provide core app services.</li>
              <li><span className="font-semibold">Contract performance</span> — to process contributions and issue invoices.</li>
              <li><span className="font-semibold">Legal obligation</span> — to retain accounting records.</li>
              <li><span className="font-semibold">Consent</span> — for adhan notifications and any system-level permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. Data Retention</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Local preferences: kept on your device until you delete them.</li>
              <li>Invoice records: kept for <span className="font-semibold">10 years</span> per tax/accounting requirements.</li>
              <li>Third-party logs: subject to those services’ policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. Your Rights</h2>
            <p className="mb-2">For users worldwide — and especially in the EU/UK — you have the rights to:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Access</span> your data.</li>
              <li><span className="font-semibold">Rectification</span>.</li>
              <li><span className="font-semibold">Erasure</span> (subject to legal retention).</li>
              <li><span className="font-semibold">Restriction</span> or <span className="font-semibold">objection</span> to processing.</li>
              <li><span className="font-semibold">Data portability</span>.</li>
              <li><span className="font-semibold">Withdraw consent</span> at any time.</li>
              <li>Lodge a complaint with the competent supervisory authority.</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, contact <span className="font-semibold">support@atraa.xyz</span> — we respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. International Transfers</h2>
            <p>Hosting infrastructure may transfer transactional data to data centers in the EU, UK, and USA. Appropriate safeguards (SCCs or adequacy decisions) are applied where required.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. Security</h2>
            <p>We use appropriate protections (HTTPS, encryption in transit, database RLS, restricted access roles). No system can be 100% secure, but we adhere to current industry standards.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. Cookies</h2>
            <p>The app itself does not use identifying cookies. The Paddle checkout page may use operational cookies necessary to complete payment — governed by Paddle’s policy referenced above.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">13. Children</h2>
            <p>The app is not directed to children under 13. We do not knowingly collect personal data from minors.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">14. Changes</h2>
            <p>We may update this Notice. The last-updated date appears at the top, and material changes will be announced inside the app.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">15. Contact</h2>
            <p>Data Controller: <span className="font-semibold">Bin Jaafar</span><br />Email: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default PrivacyPage;
