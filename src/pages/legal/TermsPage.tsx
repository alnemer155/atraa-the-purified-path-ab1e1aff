import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

const TermsPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'شروط الاستخدام' : 'Terms of Use'}
      updated={isAr ? 'آخر تحديث: 2026-04-21' : 'Last updated: 2026-04-21'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              تحكم هذه الشروط استخدامك لتطبيق "عِتَرَةً" والموقع المرتبط به (atraa.xyz). باستخدامك التطبيق فإنك تُقرّ بقراءة هذه الشروط وفهمها وقبولها بالكامل. إن لم توافق على أي بند، فيُرجى التوقّف عن استخدام التطبيق فوراً.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. القبول والأهلية</h2>
            <p>باستخدامك التطبيق فإنك تُقرّ بأنك:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85 mt-1">
              <li>قد بلغت سنّ الرشد القانوني في بلدك أو لديك إذن وليّ الأمر.</li>
              <li>تستخدم التطبيق وفقاً للقوانين المحلية والدولية المعمول بها.</li>
              <li>تتحمّل المسؤولية الكاملة عن استخدامك للمحتوى المعروض.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. وصف الخدمة</h2>
            <p>"عِتَرَةً" تطبيق ديني يُقدّم: أوقات الصلاة (بالحساب الجعفري)، اتجاه القبلة، التاريخ الهجري، الأدعية، الزيارات، الأذكار، التسبيح الرقمي، وعرض القرآن الكريم بالرسم العثماني. التطبيق مجاني بالكامل ولا يتطلب اشتراكاً أو تسجيل حساب.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. الاستخدام المقبول</h2>
            <p className="mb-2">تتعهّد بألّا تستخدم التطبيق:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>لأي غرض غير مشروع أو يخالف القوانين المحلية.</li>
              <li>لإلحاق ضرر بالخدمة أو محاولة اختراقها أو الوصول غير المُصرَّح به لأنظمتها.</li>
              <li>لإعادة بيع المحتوى أو إعادة توزيعه تجارياً دون إذن مكتوب.</li>
              <li>لانتهاك حقوق ملكية فكرية لأي طرف.</li>
              <li>بطريقة تتعارض مع قواعد متجر Apple App Store أو Google Play Store.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. الملكية الفكرية</h2>
            <p className="mb-2">تنقسم الملكية الفكرية في التطبيق إلى:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">النصوص الدينية</span> (آيات القرآن، الأدعية، الزيارات، الأذكار): مصدرها التراث الإسلامي وهي ملكية عامة. مصدر القرآن: مجمع الملك فهد لطباعة المصحف الشريف عبر AlQuran.cloud. مصدر الأدعية: حقيبة المؤمن.</li>
              <li><span className="font-semibold">تصميم التطبيق وكوده وأيقوناته وشعاراته الموسمية</span>: محمي بحقوق الملكية الفكرية لمشروع "عِتَرَةً". لا يجوز إعادة استخدامه دون إذن كتابي.</li>
              <li><span className="font-semibold">العلامات التجارية</span> المستخدمة من خدمات الطرف الثالث (AlAdhan، AlQuran.cloud إلخ) ملكية لأصحابها.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. حدود المسؤولية</h2>
            <p className="mb-2">المستخدم مسؤول وحده عن:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>صحّة المعلومات الدينية التي يعتمد عليها — يُنصح بمراجعة المراجع الفقهية المعتمدة.</li>
              <li>دقة أوقات الصلاة في حالات الاحتياط — يُنصح بمراجعة التقاويم المحلية.</li>
              <li>دقة اتجاه القبلة — يُنصح بمعايرة بوصلة الجهاز.</li>
            </ul>
            <p className="mt-2">لا نتحمّل مسؤولية أي ضرر مباشر أو غير مباشر أو عرضي ينتج عن استخدام التطبيق.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. خدمات الطرف الثالث</h2>
            <p>يعتمد التطبيق على خدمات خارجية (AlAdhan، AlQuran.cloud، wttr.in، Nominatim) لتقديم وظائفه. توقّف أي من هذه الخدمات أو تغيير سياساتها قد يؤثر على بعض الميزات. لا نضمن استمراريتها.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. الدعم المالي والتبرّعات</h2>
            <p>يحتوي التطبيق على صفحة <span className="font-semibold">"دعم عِتَرَةً"</span> لاستقبال مساهمات اختيارية من باب التقدير على الجهد المبذول. <span className="font-semibold">المطوّر من السادة الهاشميين، ولا تجوز له الصدقة شرعاً</span>؛ لذا فإن أي مساهمة تُقدَّم تُعدّ مكافأة وتقديراً وليست صدقة. لا تترتّب على المساهمة أي خدمات إضافية أو ميزات حصرية.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. الإشعارات</h2>
            <p>عند تفعيل إشعارات الأذان، فإنك توافق على أن يعرض التطبيق إشعارات محلية في أوقات الصلاة. يمكنك إيقافها في أي وقت من إعدادات التطبيق أو إعدادات النظام.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. تعديل الشروط</h2>
            <p>يحق لنا تحديث هذه الشروط في أي وقت. سيظهر تاريخ آخر تحديث في أعلى الصفحة. استمرارك في استخدام التطبيق بعد التحديث يُعدّ موافقة ضمنية على البنود الجديدة.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. إنهاء الخدمة</h2>
            <p>يحق لنا إيقاف التطبيق أو سحبه من المتاجر في أي وقت ودون إشعار مسبق. يحق لك أيضاً التوقف عن استخدامه وحذفه في أي لحظة دون أي التزام.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. القانون الحاكم</h2>
            <p>تخضع هذه الشروط لقوانين المملكة العربية السعودية، ويختصّ القضاء السعودي بأي نزاع ينشأ عنها.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. التواصل</h2>
            <p>للاستفسارات أو البلاغات القانونية: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              These Terms govern your use of the "Atraa" app and the related website (atraa.xyz). By using the app you confirm that you have read, understood, and fully accepted these Terms. If you do not agree with any clause, please stop using the app immediately.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Acceptance & Eligibility</h2>
            <p>By using the app you confirm that you:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85 mt-1">
              <li>Have reached legal age in your country or have parental consent.</li>
              <li>Use the app in compliance with applicable local and international laws.</li>
              <li>Take full responsibility for your use of the displayed content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Service Description</h2>
            <p>"Atraa" is a religious app providing: prayer times (Ja'fari calculation), Qibla direction, Hijri calendar, supplications, ziyarat, adhkar, digital tasbih, and Quran display in Uthmani script. The app is fully free and does not require a subscription or account registration.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Acceptable Use</h2>
            <p className="mb-2">You undertake not to use the app:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>For any unlawful purpose or in violation of local laws.</li>
              <li>To harm the service, attempt to hack it, or gain unauthorised access.</li>
              <li>To resell or commercially redistribute content without written permission.</li>
              <li>To infringe any third party's intellectual property rights.</li>
              <li>In a way that conflicts with Apple App Store or Google Play Store policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Intellectual Property</h2>
            <p className="mb-2">IP in the app is split as follows:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Religious texts</span> (Quran, duas, ziyarat, adhkar): sourced from Islamic heritage and are public domain. Quran source: King Fahd Glorious Quran Printing Complex via AlQuran.cloud. Duas source: Haqibat al-Mu'min.</li>
              <li><span className="font-semibold">App design, code, icons, and seasonal logos</span>: protected IP of the "Atraa" project. May not be reused without written permission.</li>
              <li><span className="font-semibold">Trademarks</span> of third-party services (AlAdhan, AlQuran.cloud, etc.) belong to their owners.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Limitation of Liability</h2>
            <p className="mb-2">The user alone is responsible for:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>The accuracy of religious information they rely on — consult qualified jurisprudential references.</li>
              <li>Prayer-time accuracy in cases of caution — consult local timetables.</li>
              <li>Qibla direction accuracy — calibrate device compass.</li>
            </ul>
            <p className="mt-2">We accept no liability for any direct, indirect, or incidental damage from using the app.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Third-Party Services</h2>
            <p>The app relies on external services (AlAdhan, AlQuran.cloud, wttr.in, Nominatim) for its functions. The discontinuation or policy change of any of them may affect some features. We do not guarantee their continuity.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. Financial Support & Donations</h2>
            <p>The app contains a <span className="font-semibold">"Support Atraa"</span> page to receive optional contributions as appreciation for the effort. <span className="font-semibold">The developer is a Hashemite Sayyid, to whom Sadaqah is religiously not permitted</span>; therefore any contribution is regarded as a reward and appreciation, not a Sadaqah. No additional services or exclusive features result from a contribution.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">8. Notifications</h2>
            <p>By enabling adhan notifications you agree the app may display local notifications at prayer times. You can disable them at any time from app settings or system settings.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">9. Changes to Terms</h2>
            <p>We may update these Terms at any time. The last-updated date appears at the top. Continued use of the app after changes constitutes implicit acceptance of the new clauses.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">10. Termination</h2>
            <p>We may discontinue or remove the app from stores at any time without prior notice. You may also stop using and delete it at any moment without obligation.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">11. Governing Law</h2>
            <p>These Terms are governed by the laws of the Kingdom of Saudi Arabia, and Saudi courts shall have jurisdiction over any disputes arising from them.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">12. Contact</h2>
            <p>Legal inquiries: <span className="font-semibold">support@atraa.xyz</span></p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default TermsPage;
