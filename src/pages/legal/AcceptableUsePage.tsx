import { useTranslation } from 'react-i18next';
import LegalLayout from '@/components/legal/LegalLayout';

/**
 * Acceptable Use Policy.
 * Seller: Bin Jaafar.
 * Last updated: 2026-04-25 (v2.7.21).
 */
const AcceptableUsePage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <LegalLayout
      title={isAr ? 'سياسة الاستخدام المقبول' : 'Acceptable Use Policy'}
      updated={isAr ? 'آخر تحديث: 2026-04-25' : 'Last updated: 2026-04-25'}
    >
      {isAr ? (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              تُكمّل هذه السياسة <span className="font-semibold">شروط الاستخدام</span> وتشرح بالتفصيل ما يُسمح به وما يُحظر عند استخدام تطبيق <span className="font-semibold">عِتَرَةً</span> (Atraa) الذي يقدمه <span className="font-semibold">Bin Jaafar</span>. باستخدامك للتطبيق فإنك توافق على الالتزام بكل ما يلي.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. الاستخدامات المسموح بها</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>الاستخدام الشخصي للأغراض الدينية: قراءة القرآن، الأدعية، الزيارات، الأذكار، التسبيح، التحقق من أوقات الصلاة واتجاه القبلة.</li>
              <li>المشاركة الشخصية للقطات الشاشة والاقتباسات الدينية مع ذكر المصدر.</li>
              <li>تقديم المساهمات الطوعية لدعم المطوّر عبر القنوات الرسمية فقط.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. الاستخدامات المحظورة قطعياً</h2>
            <p className="mb-2">يُحظر استخدام التطبيق أو محتواه أو بنيته في أيٍّ مما يلي:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">الأنشطة غير المشروعة</span> أو المخالفة للقوانين السعودية أو الدولية.</li>
              <li><span className="font-semibold">المحتوى المسيء</span>: خطاب كراهية، عنصرية، تحريض، إهانة الأديان السماوية أو الأنبياء أو الأئمة، إساءة للصحابة أو لأهل البيت.</li>
              <li><span className="font-semibold">الاحتيال والخداع</span>: انتحال صفة الآخرين، إصدار فواتير مزوّرة، الاحتيال المالي.</li>
              <li><span className="font-semibold">الإضرار بالخدمة</span>: محاولات اختراق، حقن SQL، استغلال ثغرات، رفض الخدمة (DoS/DDoS)، استنزاف الموارد.</li>
              <li><span className="font-semibold">الوصول غير المصرّح به</span>: تجاوز آليات المصادقة، جمع البيانات بشكل آلي (scraping)، تسلّق الحدود (rate-limit bypass).</li>
              <li><span className="font-semibold">الهندسة العكسية</span>: تفكيك الكود، إزالة الحماية، استخراج الخوارزميات الخاصة.</li>
              <li><span className="font-semibold">إعادة التوزيع التجاري</span>: نسخ المحتوى المحميّ بقصد إعادة بيعه أو تضمينه في منتجات منافسة.</li>
              <li><span className="font-semibold">انتهاك الملكية الفكرية</span>: نسخ التصميم أو الشعارات أو علامة "عِتَرَةً" التجارية.</li>
              <li><span className="font-semibold">الإسراف في الإشعارات أو رسائل الدعم</span> بغرض الإزعاج.</li>
              <li><span className="font-semibold">إساءة استخدام نظام الاسترداد</span>: تقديم طلبات استرداد متكررة بنيّة الاحتيال.</li>
              <li><span className="font-semibold">انتهاك سياسات المتاجر</span>: Apple App Store أو Google Play Store.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. المحتوى الديني — حساسية خاصة</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>النصوص الدينية (آيات القرآن، الأدعية، الأذكار) ملك للمسلمين عامةً ومصدرها التراث الإسلامي. يحقّ لك الاطلاع والاستفادة الشخصية والمشاركة المحترمة.</li>
              <li>يُمنع <span className="font-semibold">منعاً باتاً</span> اقتطاع الآيات أو نصوص الأدعية بشكل مُحرَّف أو مُجتزأ يؤدّي إلى تغيير المعنى أو يُسيء للدين.</li>
              <li>يُمنع استخدام التطبيق للترويج لمعتقدات تخالف الإسلام أو لإهانة شعائر المسلمين الشيعة أو السنّة.</li>
              <li>المعلومات الدينية في التطبيق <span className="font-semibold">للتذكير العام</span>؛ للمسائل الفقهية المعقّدة يُرجى الرجوع للمراجع الفقهية المعتمدة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. الاستخدام التلقائي / البرمجي</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>يُسمح فقط للوصول البشري الطبيعي عبر الواجهة المخصّصة.</li>
              <li>يُحظر استخدام البوتات أو السكربتات أو أدوات التتبّع الآلي على واجهات التطبيق دون إذن مكتوب.</li>
              <li>أيّ تجاوز لحدود الاستخدام الصحية (مثلاً: آلاف الطلبات في الدقيقة) سيؤدّي إلى حظر فوريّ.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. عواقب المخالفة</h2>
            <p className="mb-2">في حال انتهاك هذه السياسة، يحقّ لنا — دون إشعار مسبق وبحسب جسامة المخالفة — اتّخاذ واحد أو أكثر من الإجراءات الآتية:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>إزالة المحتوى المخالف أو تقييد الوصول إلى ميزة محدّدة.</li>
              <li>حظر عنوان IP أو الجهاز.</li>
              <li>إلغاء أي مساهمة حالية ورفض المساهمات اللاحقة.</li>
              <li>الإبلاغ للسلطات المختصة في حال الاشتباه بنشاط جنائي.</li>
              <li>الملاحقة القانونية لاسترداد الأضرار.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. الإبلاغ عن المخالفات</h2>
            <p>إذا لاحظت أيّ استخدام للتطبيق يخالف هذه السياسة، أو رصدت محتوى مُسيئاً، يُرجى مراسلتنا على <span className="font-semibold">support@atraa.xyz</span> مع توضيح الحادثة وأي أدلّة متاحة. نلتزم بدراسة كل بلاغ بجدّية.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. التحديثات</h2>
            <p>قد نُحدّث هذه السياسة. تستمرّ صلاحية النسخة المنشورة هنا حتى نشر تحديث.</p>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              This Policy supplements the <span className="font-semibold">Terms of Service</span> and details what is allowed and prohibited when using the <span className="font-semibold">Atraa</span> app (عِتَرَةً) provided by <span className="font-semibold">Bin Jaafar</span>. By using the app, you agree to comply with all of the following.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">1. Permitted Uses</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Personal religious use: reading the Quran, duas, ziyarat, adhkar, tasbih, checking prayer times and Qibla direction.</li>
              <li>Personal sharing of screenshots and religious quotations with proper attribution.</li>
              <li>Voluntary contributions to support the developer through official channels only.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">2. Strictly Prohibited Uses</h2>
            <p className="mb-2">It is forbidden to use the app, its content, or its infrastructure for any of the following:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li><span className="font-semibold">Unlawful activities</span> or violations of Saudi or international laws.</li>
              <li><span className="font-semibold">Offensive content</span>: hate speech, racism, incitement, insulting revealed religions, prophets, or Imams; offending companions or the Ahlul Bayt.</li>
              <li><span className="font-semibold">Fraud and deception</span>: impersonation, fake invoices, financial fraud.</li>
              <li><span className="font-semibold">Harming the service</span>: hacking attempts, SQL injection, exploit attempts, denial-of-service, resource exhaustion.</li>
              <li><span className="font-semibold">Unauthorized access</span>: bypassing authentication, automated scraping, rate-limit bypass.</li>
              <li><span className="font-semibold">Reverse engineering</span>: decompiling code, removing protections, extracting proprietary algorithms.</li>
              <li><span className="font-semibold">Commercial redistribution</span>: copying protected content for resale or for inclusion in competing products.</li>
              <li><span className="font-semibold">Intellectual-property infringement</span>: copying our design, logos, or the "Atraa" trademark.</li>
              <li><span className="font-semibold">Notification or support spam</span> intended to harass.</li>
              <li><span className="font-semibold">Refund-system abuse</span>: filing repeated fraudulent refund claims.</li>
              <li><span className="font-semibold">Violations of store policies</span>: Apple App Store or Google Play Store.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">3. Religious Content — Special Sensitivity</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Religious texts (Quran verses, duas, adhkar) belong to all Muslims and are sourced from Islamic heritage. You may read, benefit personally, and share respectfully.</li>
              <li>It is <span className="font-semibold">strictly forbidden</span> to extract verses or supplications in a distorted or fragmented way that changes the meaning or dishonors the religion.</li>
              <li>The app must not be used to promote beliefs contrary to Islam or to insult Shia or Sunni Muslim rites.</li>
              <li>Religious information in the app is for <span className="font-semibold">general remembrance</span>; for complex jurisprudential matters, please consult qualified scholarly references.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">4. Automated / Programmatic Use</h2>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Only normal human access through the intended interface is allowed.</li>
              <li>Bots, scripts, or automated tooling against app endpoints are prohibited without written permission.</li>
              <li>Any abuse of reasonable usage limits (e.g., thousands of requests per minute) will trigger an immediate block.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">5. Consequences of Violation</h2>
            <p className="mb-2">In case of violation, we may — without prior notice and proportionate to severity — take one or more of the following actions:</p>
            <ul className="list-disc ps-5 space-y-1 text-foreground/85">
              <li>Remove violating content or restrict access to a specific feature.</li>
              <li>Block IP addresses or devices.</li>
              <li>Cancel any current contribution and refuse future ones.</li>
              <li>Report to competent authorities in case of suspected criminal activity.</li>
              <li>Pursue legal action to recover damages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">6. Reporting Violations</h2>
            <p>If you observe any use of the app that violates this Policy, or detect offensive content, please contact us at <span className="font-semibold">support@atraa.xyz</span> describing the incident and any available evidence. We commit to reviewing every report seriously.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-2">7. Updates</h2>
            <p>We may update this Policy. The version published here remains effective until an update is published.</p>
          </section>
        </>
      )}
    </LegalLayout>
  );
};

export default AcceptableUsePage;
