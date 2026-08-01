import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

/**
 * Data Collection — Atraa.
 * Rewritten for v2.9.20 to cover Atraa Cloud-stored data for the
 * Khatma / Athar features and the AI verification pipelines.
 */
const DataPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'جمع البيانات' : 'Data Collection'}
      updated={isAr ? 'آخر تحديث: 2026-07-20 — v2.13.40' : 'Last updated: 2026-07-20 — v2.13.40'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              توضّح هذه الصفحة بشكل تفصيلي ما الذي يتم جمعه أو معالجته من بيانات أثناء استخدام
              <span className="font-semibold"> منصة عترة الدينية</span> وجميع مواقعها الفرعية،
              تماشياً مع متطلّبات App Store Privacy Nutrition Labels و Google Play Data Safety و GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. الإفصاح المختصر</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">بيانات شخصية تعريفية:</span> لا شيء (لا حساب، لا بريد، لا رقم هاتف).</li>
              <li><span className="font-semibold">بيانات يتم ربطها بالمستخدم:</span> لا شيء.</li>
              <li><span className="font-semibold">تحليلات أداء مجهولة:</span> Vercel Analytics بدون معرّف مستخدم.</li>
              <li><span className="font-semibold">محلياً على جهازك:</span> تفضيلات الاستخدام والقراءة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. ما لا يتم جمعه (مؤكَّد)</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>الاسم، البريد، رقم الهاتف، أيّ معرّف شخصي.</li>
              <li>صور أو بيانات بيومترية أو جهات اتصال.</li>
              <li>سجلّ التصفح أو نشاط التطبيق التفصيلي.</li>
              <li>معرّفات الجهاز الإعلانية (IDFA / GAID).</li>
              <li>أيّ بيانات مالية أو معلومات بطاقات.</li>
              <li>عناوين IP من قِبَلنا (قد تسجّلها خدمات الطرف الثالث وفق سياساتها).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. ما يُخزَّن محلياً (على جهازك فقط)</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>المدينة وإحداثياتها، تعديل التاريخ الهجري (±2)، اللغة، المذهب.</li>
              <li>عدّاد التسبيح وآخر تسبيحة.</li>
              <li>آخر دعاء/زيارة/ذكر، آخر سورة وآية.</li>
              <li>علامات قراءة القرآن وألوان الآيات المُختارة.</li>
              <li>تفعيل إشعارات الأذان وحالة «اقتراحات اليوم».</li>
              <li>الكلمات المُلوَّنة بالنقر المزدوج في الأدعية.</li>
              <li>رمز المنشئ للختمات الخاصة، ورمز قارئ مجهول.</li>
              <li>كاش الـ PWA / Service Worker للعمل دون اتصال (واجهات، صفحات قرآن، ملفات أذان).</li>
            </ul>
            <p className="mt-2 text-muted-foreground/70 text-[11px]">هذه البيانات لا تخرج من جهازك أبداً.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. ما يُحفَظ على Atraa Cloud</h2>
            <p className="mb-2">عند مشاركتك في الميزات الاجتماعية فقط، يُحفظ على الخادم:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">الختمات</span>: العنوان والإهداء، نوع الختمة، عدد القراءات، رمز قارئ مجهول، اسم اختياري ثلاثي إذا اخترت الإفصاح، رمز منشئ مجهول، حالة النشر.</li>
              <li><span className="font-semibold">أثر</span>: قاعدة مقولات عامّة يُديرها فريق المنصة فقط — لا بيانات مستخدم.</li>
              <li><span className="font-semibold">الخلفيات</span>: قائمة عامّة فقط — لا بيانات مستخدم.</li>
            </ul>
            <p className="mt-2">الاسم الثلاثي للقارئ وعنوان الختمة يُتحقَّق منهما عبر <span className="font-semibold">Atraa AI</span> لرفض الإساءات وأسماء المعصومين، ولا يُحفَظ نص الطلب بعد التحقّق.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. الطلبات الخارجية (HTTPS)</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>AlAdhan API — أوقات الصلاة (الجعفرية).</li>
              <li>AlQuran.cloud — قائمة السور والآيات.</li>
              <li>Nominatim / OpenStreetMap — الجغرافيا العكسية عند استخدام GPS.</li>
              <li>Atraa AI — التحقّق من العناوين والأسماء.</li>
              <li>i.ibb.co — استضافة بعض الشعارات والأيقونات.</li>
              <li>Vercel Analytics — قياسات أداء مجهولة بدون معرّف مستخدم.</li>
            </ul>
            <p className="mt-2">لا يُرسَل أيّ معرّف شخصي مع هذه الطلبات.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. الأذونات على الجهاز</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">الموقع (GPS)</span> — اختياري لتحديد المدينة والقبلة.</li>
              <li><span className="font-semibold">مستشعرات الحركة</span> — اختياري لبوصلة القبلة.</li>
              <li><span className="font-semibold">الإشعارات</span> — اختياري للأذان (محلّية على الجهاز).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. حذف البيانات</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>مسح بيانات التطبيق أو الموقع من إعدادات الجهاز.</li>
              <li>إلغاء تثبيت التطبيق.</li>
              <li>راسلنا على <span className="font-semibold">support@atraa.xyz</span> — نلتزم بالردّ خلال 30 يوماً.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. إفصاح المتاجر</h2>
            <p>تصنيف Apple App Privacy: <span className="font-semibold">"Data Not Linked to You"</span> (محتوى المستخدم في الختمات/التعليقات مرتبط برمز مجهول فقط، لا بهويتك).</p>
            <p className="mt-1">تصنيف Google Play Data Safety: <span className="font-semibold">No personally identifiable data collected</span>.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. التواصل</h2>
            <p>للاستفسار: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              This page details, in a categorised format, what data is collected or processed across all Atraa services (atraa.xyz, khatma.atraa.xyz, athar.atraa.xyz, qasaid.atraa.xyz, audio.atraa.xyz, demo.atraa.xyz, and the native apps), in line with App Store Privacy Nutrition Labels, Google Play Data Safety, and GDPR.
            </p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Disclosure Summary</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Personally identifiable info: <span className="font-semibold">none</span>.</li>
              <li>Data linked to user: <span className="font-semibold">none</span>.</li>
              <li>Anonymous performance: Vercel Analytics, no user identifier.</li>
              <li>Local on your device: usage and reading preferences.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Not Collected</h2>
            <p>No name, email, phone, biometrics, contacts, photos, browsing history, advertising IDs, or financial data.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Stored Locally</h2>
            <p>City coordinates, Hijri offset, language, madhhab, tasbih state, last reading positions, ayah colors, notification toggle, qasida player state, anonymous creator/reader tokens, PWA offline cache.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Atraa Cloud Storage</h2>
            <p>Khatma title/dedication/mode, juz claims, qasida likes/comments — all linked to anonymous device tokens. Athar quotes are an editorial public collection, no user data.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. External Requests</h2>
            <p>AlAdhan, AlQuran.cloud, Nominatim/OpenStreetMap, Atraa Cloud, Atraa AI, i.ibb.co, Vercel Analytics.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Permissions</h2>
            <p>Location, motion sensors, notifications, background playback — all optional.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. Deletion</h2>
            <p>Clear app data, uninstall, or email <span className="font-semibold">support@atraa.xyz</span>. We respond within 30 days.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. Store Disclosures</h2>
            <p>Apple: "Data Not Linked to You". Google Play: No personally identifiable data collected.</p>
          </section>
          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. Contact</h2>
            <p>support@atraa.xyz</p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default DataPage;
