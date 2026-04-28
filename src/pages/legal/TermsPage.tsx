import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

/**
 * Terms of Service — Atraa.
 * Free, donation-free, payment-free Islamic app.
 * Last updated: 2026-04-28.
 */
const TermsPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'شروط الاستخدام' : 'Terms of Use'}
      updated={isAr ? 'آخر تحديث: 2026-04-28' : 'Last updated: 2026-04-28'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              تحكم هذه الشروط استخدامك لتطبيق <span className="font-semibold">عِتَرَةً</span> (Atraa) والموقع المرتبط به (atraa.xyz)، المُقدَّم من المطوّر <span className="font-semibold">Bin Jaafar</span>. باستخدامك التطبيق فإنك تُقرّ بقراءة هذه الشروط وقبولها. إن لم توافق، فيُرجى التوقّف عن الاستخدام.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. الطرفان والقبول</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>أنت تتعاقد مع <span className="font-semibold">Bin Jaafar</span> (يُشار إليه بـ "المطوّر").</li>
              <li>باستخدامك المتواصل للتطبيق فإنك توافق على هذه الشروط.</li>
              <li>يجب أن تكون قد بلغت السنّ القانونية في بلدك أو لديك إذن وليّ الأمر.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. وصف الخدمة</h2>
            <p>عِتَرَةً تطبيق ديني يُقدّم: أوقات الصلاة، اتجاه القبلة، التاريخ الهجري، الأدعية، الزيارات، الأذكار، التسبيح الرقمي، وعرض القرآن الكريم بالرسم العثماني. التطبيق <span className="font-semibold">مجاني بالكامل</span> ولا يتطلّب اشتراكاً ولا تسجيل حساب ولا أي عملية دفع.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. سوء الاستخدام</h2>
            <p className="mb-2">تتعهّد بألّا تستخدم التطبيق:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>لأي غرض غير مشروع أو يخالف القوانين المحلية أو الدولية.</li>
              <li>لإلحاق ضرر بالخدمة أو محاولة اختراقها أو الوصول غير المُصرَّح به.</li>
              <li>لنسخ المحتوى المحميّ أو إعادة توزيعه تجارياً دون إذن مكتوب.</li>
              <li>لانتهاك حقوق ملكية فكرية لأي طرف.</li>
              <li>بطريقة تتعارض مع قواعد متجر Apple App Store أو Google Play.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. الملكية الفكرية</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">النصوص الدينية</span> (القرآن، الأدعية، الزيارات، الأذكار): من التراث الإسلامي وملكية عامة. مصدر القرآن: مجمع الملك فهد لطباعة المصحف الشريف عبر AlQuran.cloud.</li>
              <li><span className="font-semibold">تصميم التطبيق وكوده وأيقوناته وعلامته التجارية</span>: محمي بحقوق الملكية الفكرية لـ Bin Jaafar. لا يجوز إعادة استخدامه دون إذن كتابي.</li>
              <li><span className="font-semibold">العلامات التجارية</span> لخدمات الطرف الثالث ملكية لأصحابها.</li>
            </ul>
            <p className="mt-2">يُمنح المستخدم ترخيصاً <span className="font-semibold">محدوداً وغير حصري وغير قابل للتحويل</span> لاستخدام التطبيق للأغراض الشخصية فقط.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. مستوى الخدمة</h2>
            <p>نبذل قصارى جهدنا لإبقاء التطبيق متاحاً وموثوقاً، لكننا <span className="font-semibold">لا نضمن</span> أن تكون الخدمة متاحة دون انقطاع أو خالية من الأخطاء أو متوافقة مع كل جهاز.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. حدود المسؤولية</h2>
            <p className="mb-2">المستخدم مسؤول وحده عن:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>صحّة المعلومات الدينية التي يعتمد عليها — يُنصح بمراجعة المراجع الفقهية المعتمدة.</li>
              <li>دقة أوقات الصلاة في حالات الاحتياط.</li>
              <li>دقة اتجاه القبلة — يُنصح بمعايرة بوصلة الجهاز.</li>
            </ul>
            <p className="mt-2">إلى أقصى حدّ يسمح به القانون، نُخلي مسؤوليتنا عن أي ضرر مباشر أو غير مباشر أو عرضي أو تبعي ينتج عن استخدام التطبيق.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. خدمات الطرف الثالث</h2>
            <p>يعتمد التطبيق على خدمات خارجية (AlAdhan، AlQuran.cloud، wttr.in، Nominatim). توقّف أي منها أو تغيير سياساتها قد يؤثر على بعض الميزات. لا نضمن استمراريتها.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. الإشعارات</h2>
            <p>عند تفعيل إشعارات الأذان، فإنك توافق على عرض إشعارات محلية في أوقات الصلاة. يمكنك إيقافها في أي وقت من الإعدادات.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. الإيقاف والإنهاء</h2>
            <p>يحقّ لنا إيقاف الوصول في حالات: المخالفة الجوهرية، أو مخاطر الأمان، أو الانتهاكات المتكررة. يحقّ لنا أيضاً سحب التطبيق من المتاجر في أي وقت ودون إشعار مسبق. ويحقّ لك التوقّف عن استخدامه وحذفه في أي لحظة دون أي التزام.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. تعديل الشروط</h2>
            <p>يحقّ لنا تحديث هذه الشروط في أي وقت. سيظهر تاريخ آخر تحديث في أعلى الصفحة. استمرارك في الاستخدام يُعدّ موافقة ضمنية.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. القانون الحاكم</h2>
            <p>تخضع هذه الشروط لقوانين <span className="font-semibold">المملكة العربية السعودية</span>. تُبذل محاولة جادّة لحلّ النزاع ودياً قبل اللجوء إلى القضاء.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. التواصل</h2>
            <p><span className="font-semibold">Bin Jaafar</span><br />البريد: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              These Terms govern your use of <span className="font-semibold">Atraa</span> (عِتَرَةً) and the related website (atraa.xyz), provided by <span className="font-semibold">Bin Jaafar</span>. By using the app you confirm that you have read and accepted these Terms. If you disagree, please stop using the app.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Parties & Acceptance</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>You are contracting with <span className="font-semibold">Bin Jaafar</span> ("the developer").</li>
              <li>By continued use you agree to these Terms.</li>
              <li>You must be of legal age in your country or have parental consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Service Description</h2>
            <p>Atraa is a religious app providing prayer times, Qibla direction, Hijri calendar, supplications, ziyarat, adhkar, digital tasbih, and Quran display in Uthmani script. The app is <span className="font-semibold">fully free</span> and requires no subscription, no account, and no payment.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Misuse</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>For any unlawful purpose or in violation of local or international laws.</li>
              <li>To harm, hack, or gain unauthorised access to the service.</li>
              <li>To copy or commercially redistribute protected content without written permission.</li>
              <li>To infringe any third party’s intellectual-property rights.</li>
              <li>In conflict with Apple App Store or Google Play policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Intellectual Property</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Religious texts</span> are public domain. Quran source: King Fahd Glorious Quran Printing Complex via AlQuran.cloud.</li>
              <li><span className="font-semibold">App design, code, icons, and branding</span> are protected IP of Bin Jaafar. Reuse requires written permission.</li>
              <li><span className="font-semibold">Third-party trademarks</span> belong to their respective owners.</li>
            </ul>
            <p className="mt-2">You receive a <span className="font-semibold">limited, non-exclusive, non-transferable</span> licence to use the app for personal purposes only.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Service Level</h2>
            <p>We do our best to keep the app available and reliable, but <span className="font-semibold">do not guarantee</span> uninterrupted, error-free, or universally compatible service.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Limitation of Liability</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Religious accuracy — consult qualified jurisprudential references.</li>
              <li>Prayer-time accuracy in cases of caution — consult local timetables.</li>
              <li>Qibla accuracy — calibrate device compass.</li>
            </ul>
            <p className="mt-2">To the fullest extent permitted by law, we disclaim liability for any direct, indirect, incidental, or consequential damage arising from app use.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. Third-Party Services</h2>
            <p>The app relies on external services (AlAdhan, AlQuran.cloud, wttr.in, Nominatim). Outages or policy changes may affect features. No continuity guarantee.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. Notifications</h2>
            <p>Enabling Adhan notifications means you accept local prayer-time reminders. You can disable them anytime in Settings.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. Suspension & Termination</h2>
            <p>We may suspend access for material breach, security risks, or repeated violations, and may withdraw the app from stores at any time without notice. You may stop using and delete the app at any moment without obligation.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. Changes to Terms</h2>
            <p>We may update these Terms. The last-updated date is shown at the top. Continued use means acceptance.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. Governing Law</h2>
            <p>These Terms are governed by the laws of <span className="font-semibold">Saudi Arabia</span>. Disputes are first attempted to be resolved amicably.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. Contact</h2>
            <p><span className="font-semibold">Bin Jaafar</span><br />Email: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default TermsPage;
