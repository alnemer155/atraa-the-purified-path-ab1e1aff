import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

/**
 * Privacy Policy — Atraa.
 * Free, donation-free, payment-free Islamic app.
 * Last updated: 2026-04-28.
 */
const PrivacyPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
      updated={isAr ? 'آخر تحديث: 2026-07-20 — v2.13.40' : 'Last updated: 2026-07-20 — v2.13.40'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              تطبيق <span className="font-semibold">منصة عترة الدينية</span> (Atraa) يلتزم بمبدأ <span className="font-semibold">الخصوصية أولاً</span>. لا حساب مستخدم في النواة الدينية، ولا تُجمع أي بيانات شخصية تعريفية. تُغطّي هذه السياسة المنصة الرئيسية والمواقع الفرعية: <span className="font-semibold">khatma.atraa.xyz</span> و<span className="font-semibold">athar.atraa.xyz</span>.
            </p>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed mt-2">
              المتحكّم بالبيانات: <span className="font-semibold">Bin Jaafar</span> · <span className="font-semibold">support@atraa.xyz</span>.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. ملخّص تنفيذي</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>لا حساب، لا تسجيل دخول، لا بريد إلكتروني، لا رقم هاتف.</li>
              <li>لا تتبّع إعلاني، ولا أدوات تحليل تعرّف عن المستخدم.</li>
              <li>التفضيلات تُحفظ <span className="font-semibold">محلياً على جهازك</span> (localStorage).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. البيانات المحفوظة محلياً على جهازك</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>المدينة وإحداثياتها، تعديل التاريخ الهجري (-2 إلى +2)، اللغة، المذهب.</li>
              <li>عدّاد التسبيح وآخر تسبيحة.</li>
              <li>آخر دعاء/زيارة/ذكر، آخر سورة/صفحة قرآن، علامات قراءة القرآن.</li>
              <li>تفعيل إشعارات الأذان، الأوضاع المُكمَلة من «اقتراحات اليوم».</li>
              <li>الكلمات المُلوَّنة بالنقر المزدوج في الأدعية.</li>
              <li>رمز المنشئ للختمات الخاصة، ورمز قارئ مجهول لتسجيل القراءة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. الميزات السحابية (الختمات / أثر)</h2>
            <p className="mb-2">عند مشاركتك في إحدى الميزات الاجتماعية، يُحفظ على خادم Atraa Cloud:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">الختمات</span>: العنوان والإهداء، نوع الختمة، عدد القراءات، رمز قارئ مجهول، اسم اختياري ثلاثي إذا اخترت الإفصاح، رمز منشئ مجهول.</li>
              <li><span className="font-semibold">أثر</span>: مقولات عامة يُديرها فريق التطبيق فقط — لا بيانات مستخدم.</li>
            </ul>
            <p className="mt-2">الاسم الثلاثي يُتحقَّق منه عبر AI (Atraa AI) لرفض الإساءات وأسماء المعصومين، ولا يُحفَظ نص الطلب بعد التحقّق.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. الخدمات الخارجية</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">AlAdhan API</span> — أوقات الصلاة (الجعفرية).</li>
              <li><span className="font-semibold">AlQuran.cloud</span> — نص القرآن بالرسم العثماني / KFGQPC.</li>
              <li><span className="font-semibold">Nominatim (OpenStreetMap)</span> — بحث المدن.</li>
              <li><span className="font-semibold">Atraa AI</span> — التحقّق من العنوان والاسم في الختمات.</li>
              <li><span className="font-semibold">Vercel Analytics</span> — قياسات أداء مجهولة بدون معرّف مستخدم.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. الأذونات على الجهاز</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">الموقع (GPS)</span> — اختياري لتحديد المدينة والقبلة.</li>
              <li><span className="font-semibold">مستشعرات الحركة</span> — اختياري لبوصلة القبلة.</li>
              <li><span className="font-semibold">الإشعارات</span> — اختياري للأذان (محلية على الجهاز).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. الوضع دون اتصال (PWA / تطبيق أصلي)</h2>
            <p>عند تثبيت التطبيق كـ PWA أو تنزيله من المتجر، يُخزَّن جزء من المحتوى الأساسي (واجهات، صفحات قرآن، ملفات الأذان) محلياً للعمل دون اتصال. لا يُرسَل أي شيء من هذا الكاش إلى الخادم.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. حقوقك</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>حذف جميع بياناتك بمسح بيانات التطبيق أو إلغاء تثبيته.</li>
              <li>طلب حذف ختمة أنشأتها برمز المنشئ.</li>
              <li>سحب أي إذن نظام في أي وقت.</li>
              <li>الاستفسار عبر <span className="font-semibold">support@atraa.xyz</span> — نلتزم بالردّ خلال 30 يوماً.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. الأطفال والأمان</h2>
            <p>التطبيق ليس موجهاً للأطفال دون 13 عاماً. كل الطلبات الخارجية عبر HTTPS. لا نضمن أمناً مطلقاً لكن نتبع المعايير الحديثة.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. التواصل</h2>
            <p>المتحكّم بالبيانات: <span className="font-semibold">Bin Jaafar</span><br />البريد: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              <span className="font-semibold">Atraa</span> (عِتَرَةً) is built on a <span className="font-semibold">Privacy by Design</span> principle. There is no user account inside the app, and no personally identifying data is collected to operate its features. This Notice explains what is stored, where, and why.
            </p>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed mt-2">
              Data Controller: <span className="font-semibold">Bin Jaafar</span>. Contact: <span className="font-semibold">support@atraa.xyz</span>.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Executive Summary</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>No account, no sign-in, no email, no phone number.</li>
              <li>No advertising trackers, no user-identifying analytics.</li>
              <li>All preferences are stored <span className="font-semibold">locally on your device only</span>.</li>
              <li>External requests are restricted to religious and geographical services and use city coordinates only — no user identifier.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Data Stored Locally</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Selected city name and coordinates.</li>
              <li>Hijri date offset (-2 to +2).</li>
              <li>Madhhab chosen during onboarding.</li>
              <li>Preferred language (Arabic / English).</li>
              <li>Tasbih state and current count.</li>
              <li>Last reading in duas, ziyarat, and adhkar.</li>
              <li>Last surah and ayah in Quran.</li>
              <li>Adhan notifications on/off.</li>
              <li>One-day cache for the Verse of the Day.</li>
            </ul>
            <p className="mt-2">None of this data is sent to any server.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Third-Party Services</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">AlAdhan API</span> — prayer times.</li>
              <li><span className="font-semibold">AlQuran.cloud</span> — Uthmani-script Quran text.</li>
              <li><span className="font-semibold">Nominatim (OpenStreetMap)</span> — city search.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. No Tracking, No Analytics</h2>
            <p>We do not use Google Analytics, Facebook Pixel, or any user-identifying ad/analytics tool. No marketing cookies.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Device Permissions</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Location (GPS)</span> — optional; to determine the city and Qibla bearing. Never sent to our servers.</li>
              <li><span className="font-semibold">Motion sensors</span> — optional; for the compass only.</li>
              <li><span className="font-semibold">Notifications</span> — optional; for local Adhan reminders.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Your Rights</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Erase all data by clearing app data or uninstalling the app.</li>
              <li>Withdraw any system permission (location, notifications, motion) at any time.</li>
              <li>Contact <span className="font-semibold">support@atraa.xyz</span> — we reply within 30 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. Security</h2>
            <p>All external requests use HTTPS, and no sensitive data is stored. No system can be 100% secure, but we follow modern industry standards.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. Children</h2>
            <p>The app is not directed at children under 13. We do not knowingly collect personal data from minors.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. Updates</h2>
            <p>We may update this Notice. The last-updated date will be shown at the top of the page.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. Contact</h2>
            <p>Data Controller: <span className="font-semibold">Bin Jaafar</span><br />Email: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default PrivacyPage;
